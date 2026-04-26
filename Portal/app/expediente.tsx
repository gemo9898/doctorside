import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Modal, ActivityIndicator, SafeAreaView
} from 'react-native';

const COLORS = {
  IMSS_GREEN: '#1F5D50',
  IMSS_GOLD: '#B38E5D',
  CRITICAL: '#9E1B32',
  WARNING: '#D4AF37',
  STABLE: '#2E7D32',
  TEXT: '#2D3A3A',
  BG: '#F4F7F7',
  INFO: '#0071CE',
  PURPLE: '#6A1B9A'
};

const FB_BASE = 'https://firestore.googleapis.com/v1/projects/hack-441ef/databases/(default)/documents';

export default function DoctorSmartDashboard() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [selPatient, setSelPatient] = useState<any | null>(null);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [resU, resG, resM, resP, resA] = await Promise.all([
        fetch(`${FB_BASE}/usuarios`),
        fetch(`${FB_BASE}/testgad7`),
        fetch(`${FB_BASE}/testmmse`),
        fetch(`${FB_BASE}/testphq9`),
        fetch(`${FB_BASE}/registro_audios`)
      ]);
      
      const [uD, gD, mD, pD, aD] = await Promise.all([
        resU.json(), resG.json(), resM.json(), resP.json(), resA.json()
      ]);

      const userMap: any = {};

      // 1. Mapeo base de usuarios
      uD.documents?.forEach((doc: any) => {
        const f = doc.fields;
        const name = f?.username?.stringValue;
        if (name) {
          const key = name.toLowerCase().trim();
          userMap[key] = {
            username: name,
            nss: f.nss?.stringValue || "N/A",
            gad7: null, mmse: null, phq9: null,
            voiceHistory: []
          };
        }
      });

      // 2. Vinculación GAD-7
      gD.documents?.forEach((d: any) => {
        const k = d.fields?.userName?.stringValue?.toLowerCase().trim();
        if(k && userMap[k]) {
          userMap[k].gad7 = { 
            score: parseInt(d.fields.puntuacion?.integerValue || "0"), 
            pred: d.fields.ia_prediccion?.stringValue || "Sin predicción" 
          };
        }
      });

      // 3. Vinculación MMSE
      mD.documents?.forEach((d: any) => {
        const k = d.fields?.userName?.stringValue?.toLowerCase().trim();
        if(k && userMap[k]) {
          userMap[k].mmse = d.fields.ia_prediccion?.stringValue || "Sin datos cognitivos";
        }
      });

      // 4. Vinculación PHQ-9
      pD.documents?.forEach((d: any) => {
        const k = d.fields?.userName?.stringValue?.toLowerCase().trim();
        if(k && userMap[k]) {
          userMap[k].phq9 = { 
            score: parseInt(d.fields.puntuacion?.integerValue || "0"), 
            pred: d.fields.ia_prediccion?.stringValue || "Sin predicción" 
          };
        }
      });

      // 5. Vinculación Audios (Protección contra campos inexistentes)
      aD.documents?.forEach((d: any) => {
        const f = d.fields;
        const uName = f?.username?.stringValue || f?.userName?.stringValue;
        const k = uName?.toLowerCase().trim();
        if(k && userMap[k]) {
          userMap[k].voiceHistory.push(parseInt(f?.indicadorRiesgo?.integerValue || "0"));
        }
      });

      setPatients(Object.values(userMap));
    } catch (e) {
      console.error("Error en Fetch:", e);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Triaje (Semáforo) - Blindada contra nulos
  const getTriaje = (p: any) => {
    if (!p) return { label: 'PENDIENTE', color: '#CCC', light: '#EEE' };
    const scoreG = p.gad7?.score || 0;
    const scoreP = p.phq9?.score || 0;
    const max = Math.max(scoreG, scoreP);
    
    if (max >= 15 || (p.mmse && p.mmse.toLowerCase().includes("severo"))) 
      return { label: 'CRÍTICO', color: COLORS.CRITICAL, light: '#F9EBEB' };
    if (max >= 10) 
      return { label: 'SEGUIMIENTO', color: COLORS.WARNING, light: '#FEF9E7' };
    return { label: 'ESTABLE', color: COLORS.STABLE, light: '#EAF9F1' };
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.IMSS_GREEN} /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.headerTitle}>SISTEMA DE TRIAJE MULTIMODAL</Text>
        <Text style={s.headerSub}>Control de Tamizaje e Indicadores de Voz</Text>
      </View>

      <ScrollView contentContainerStyle={s.container}>
        {patients.map((p) => {
          const triaje = getTriaje(p);
          const vCount = p.voiceHistory?.length || 0;
          const vAvg = vCount > 0 ? (p.voiceHistory.reduce((a:any,b:any)=>a+b,0) / vCount).toFixed(0) : null;

          return (
            <TouchableOpacity key={p.username} style={s.card} onPress={() => setSelPatient(p)}>
              <View style={[s.cardStatusLine, {backgroundColor: triaje.color}]} />
              <View style={s.cardBody}>
                <View style={s.row}>
                  <Text style={s.patientName}>{p.username}</Text>
                  <View style={[s.badge, {backgroundColor: triaje.light}]}>
                    <Text style={[s.badgeText, {color: triaje.color}]}>{triaje.label}</Text>
                  </View>
                </View>
                <View style={s.metricsRow}>
                  <View style={s.metricBox}><Text style={s.mLabel}>GAD-7</Text><Text style={s.mVal}>{p.gad7?.score || '--'}</Text></View>
                  <View style={s.metricBox}><Text style={s.mLabel}>PHQ-9</Text><Text style={s.mVal}>{p.phq9?.score || '--'}</Text></View>
                  <View style={s.vDivider} />
                  <View style={s.metricBox}>
                    <Text style={s.mLabel}>RIESGO VOZ</Text>
                    <Text style={[s.mVal, {color: Number(vAvg) > 60 ? COLORS.CRITICAL : COLORS.TEXT}]}>
                      {vAvg ? `${vAvg}%` : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* MODAL DE DETALLE - BLINDADO CON CONDICIONAL */}
      <Modal visible={!!selPatient} animationType="slide" transparent={false}>
        {selPatient && (
          <View style={s.modalRoot}>
            <View style={[s.modalHeader, {backgroundColor: getTriaje(selPatient).color}]}>
              <TouchableOpacity onPress={() => setSelPatient(null)}><Text style={s.backBtn}>✕ CERRAR</Text></TouchableOpacity>
              <Text style={s.modalTitle}>{selPatient.username}</Text>
              <Text style={s.modalSub}>Expediente: {selPatient.nss}</Text>
            </View>

            <ScrollView style={s.modalScroll}>
              {/* INDICADOR DE VOZ */}
              <View style={s.sectionCard}>
                <Text style={s.sectionTitle}>BIOMARCADOR DE VOZ (IA)</Text>
                <View style={s.voiceContainer}>
                   <View style={[s.voiceCircle, {borderColor: (selPatient.voiceHistory?.length > 0) ? COLORS.IMSS_GREEN : '#EEE'}]}>
                      <Text style={s.voiceNum}>
                        {selPatient.voiceHistory?.length > 0 
                          ? (selPatient.voiceHistory.reduce((a:any,b:any)=>a+b,0)/selPatient.voiceHistory.length).toFixed(0)
                          : '0'}%
                      </Text>
                      <Text style={s.voiceSub}>Riesgo</Text>
                   </View>
                   <View style={{flex:1, marginLeft: 15}}>
                      <Text style={s.infoText}>Promedio de {selPatient.voiceHistory?.length || 0} muestras.</Text>
                      <Text style={s.infoTextSmall}>Valores $> 60\%$ indican posible embotamiento afectivo.</Text>
                   </View>
                </View>
              </View>

              {/* PREDICCIONES IA */}
              <IAPredictView title="DEPRESIÓN (PHQ-9)" text={selPatient.phq9?.pred} color={COLORS.PURPLE} />
              <IAPredictView title="ANSIEDAD (GAD-7)" text={selPatient.gad7?.pred} color={COLORS.IMSS_GOLD} />
              
              <Text style={s.sectionTitle}>PREDICCIÓN COGNITIVA (MMSE)</Text>
              <View style={s.iaBox}><Text style={s.iaText}>{selPatient.mmse || "Sin datos registrados."}</Text></View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const IAPredictView = ({title, text, color}: any) => (
  <View style={{marginBottom: 20}}>
    <Text style={[s.sectionTitle, {color}]}>{title}</Text>
    <View style={[s.iaBox, {borderLeftColor: color, borderLeftWidth: 5}]}>
      <Text style={s.iaText}>{text || "No hay una predicción de IA disponible para este test."}</Text>
    </View>
  </View>
);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.BG },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.IMSS_GREEN, padding: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  headerSub: { color: 'white', fontSize: 10, opacity: 0.8 },
  container: { padding: 15 },
  card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 12, flexDirection: 'row', elevation: 3, height: 95 },
  cardStatusLine: { width: 8, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  cardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  patientName: { fontSize: 17, fontWeight: 'bold', color: COLORS.TEXT },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 9, fontWeight: 'bold' },
  metricsRow: { flexDirection: 'row', alignItems: 'center' },
  metricBox: { marginRight: 15 },
  mLabel: { fontSize: 8, color: '#999', fontWeight: 'bold' },
  mVal: { fontSize: 15, fontWeight: 'bold' },
  vDivider: { width: 1, height: 20, backgroundColor: '#EEE', marginRight: 15 },
  modalRoot: { flex: 1, backgroundColor: COLORS.BG },
  modalHeader: { padding: 25, paddingTop: 40 },
  backBtn: { color: 'white', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  modalTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  modalSub: { color: 'white', fontSize: 12, opacity: 0.9 },
  modalScroll: { padding: 20 },
  sectionCard: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#666', marginBottom: 10 },
  voiceContainer: { flexDirection: 'row', alignItems: 'center' },
  voiceCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, justifyContent: 'center', alignItems: 'center' },
  voiceNum: { fontSize: 22, fontWeight: 'bold' },
  voiceSub: { fontSize: 8, color: '#999' },
  infoText: { fontSize: 13, fontWeight: 'bold', color: COLORS.TEXT },
  infoTextSmall: { fontSize: 11, color: '#888', fontStyle: 'italic' },
  iaBox: { backgroundColor: 'white', padding: 15, borderRadius: 10, elevation: 1 },
  iaText: { fontSize: 13, color: COLORS.TEXT, lineHeight: 20, fontStyle: 'italic' }
});
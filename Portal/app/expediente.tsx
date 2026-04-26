import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Modal, ActivityIndicator
} from 'react-native';

const COLORS = {
  IMSS_GREEN: '#1F5D50',
  IMSS_GOLD: '#B38E5D',
  CRITICAL: '#9E1B32',
  WARNING: '#D4AF37',
  STABLE: '#2E7D32',
  TEXT: '#2D3A3A',
  BG: '#F0F3F3',
  INFO: '#0071CE',
  PURPLE: '#6A1B9A'
};

const FB_BASE = 'https://firestore.googleapis.com/v1/projects/hack-441ef/databases/(default)/documents';

export default function DoctorUnifiedDashboard() {
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
      
      const [uData, gData, mData, pData, aData] = await Promise.all([
        resU.json(), resG.json(), resM.json(), resP.json(), resA.json()
      ]);

      const userMap: any = {};

      // 1. Inicializar con Tabla de Usuarios
      uData.documents?.forEach((doc: any) => {
        const f = doc.fields;
        const name = f.username?.stringValue;
        if (name) {
          const key = name.toLowerCase().trim();
          userMap[key] = {
            username: name,
            nss: f.nss?.stringValue || "N/A",
            gad7: null, mmse: null, phq9: null, voiceHistory: []
          };
        }
      });

      // 2. Vincular GAD-7 por userName
      gData.documents?.forEach((doc: any) => {
        const f = doc.fields;
        const key = f.userName?.stringValue?.toLowerCase().trim();
        if (key && userMap[key]) {
          userMap[key].gad7 = { nivel: f.nivel?.stringValue, prediccion: f.ia_prediccion?.stringValue };
        }
      });

      // 3. Vincular MMSE por userName
      mData.documents?.forEach((doc: any) => {
        const f = doc.fields;
        const key = f.userName?.stringValue?.toLowerCase().trim();
        if (key && userMap[key]) {
          userMap[key].mmse = f.ia_prediccion?.stringValue;
        }
      });

      // 4. Vincular PHQ-9 por userName
      pData.documents?.forEach((doc: any) => {
        const f = doc.fields;
        const key = f.userName?.stringValue?.toLowerCase().trim();
        if (key && userMap[key]) {
          userMap[key].phq9 = { nivel: f.nivel?.stringValue, prediccion: f.ia_prediccion?.stringValue };
        }
      });

      // 5. Vincular AUDIOS por username (Cambio solicitado)
      aData.documents?.forEach((doc: any) => {
        const f = doc.fields;
        // Se asume que en registro_audios existe el campo 'username' o se extrae del objeto si existe
        const uNameAttr = f.username?.stringValue || f.userName?.stringValue;
        const key = uNameAttr?.toLowerCase().trim();
        
        if (key && userMap[key]) {
          userMap[key].voiceHistory.push({
            risk: parseInt(f.indicadorRiesgo?.integerValue || "0"),
            ppm: parseInt(f.palabrasPorMinuto?.integerValue || "0"),
            timestamp: f.timestamp?.stringValue
          });
        }
      });

      setPatients(Object.values(userMap).sort((a: any, b: any) => (b.gad7 ? 1 : -1)));
    } catch (e) {
      console.error("Error vinculando por username:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.IMSS_GREEN} /></View>;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.headerTitle}>CONTROL INTEGRAL POR USERNAME</Text>
        <Text style={s.headerSub}>Consolidación Automática de Tamizaje y Voz</Text>
      </View>

      <ScrollView contentContainerStyle={s.container}>
        {patients.map((p) => (
          <TouchableOpacity key={p.username} style={s.patientRow} onPress={() => setSelPatient(p)}>
            <View style={[s.statusLine, {backgroundColor: p.voiceHistory.length > 0 ? COLORS.IMSS_GREEN : '#CCC'}]} />
            <View style={s.patientInfo}>
              <Text style={s.patientId}>{p.username}</Text>
              <Text style={s.patientNss}>NSS: {p.nss}</Text>
              <View style={s.badgeRow}>
                {p.gad7 && <View style={[s.badge, {backgroundColor: COLORS.IMSS_GOLD}]}><Text style={s.badgeT}>GAD-7</Text></View>}
                {p.phq9 && <View style={[s.badge, {backgroundColor: COLORS.PURPLE}]}><Text style={s.badgeT}>PHQ-9</Text></View>}
                {p.mmse && <View style={[s.badge, {backgroundColor: COLORS.INFO}]}><Text style={s.badgeT}>MMSE</Text></View>}
              </View>
            </View>
            <View style={s.rightInfo}>
                <Text style={s.voiceCount}>{p.voiceHistory.length}</Text>
                <Text style={s.voiceLabel}>AUDIOS</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={!!selPatient} animationType="slide">
        <View style={s.modalRoot}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setSelPatient(null)}><Text style={s.backBtn}>✕ VOLVER</Text></TouchableOpacity>
            <Text style={s.modalTitle}>{selPatient?.username}</Text>
            <Text style={s.modalSub}>Expediente Unificado de Salud Mental</Text>
          </View>

          <ScrollView style={{padding: 20}}>
            {/* PREDICCIONES DE IA */}
            <IAResultCard title="DEPRESIÓN (PHQ-9)" data={selPatient?.phq9} color={COLORS.PURPLE} />
            <IAResultCard title="ANSIEDAD (GAD-7)" data={selPatient?.gad7} color={COLORS.IMSS_GOLD} />
            
            <Text style={s.sectionTitle}>PREDICCIÓN COGNITIVA (MMSE)</Text>
            <View style={[s.iaCard, {borderLeftColor: COLORS.INFO, marginBottom: 25}]}>
                <Text style={s.iaText}>{selPatient?.mmse || "No se registran datos de MMSE."}</Text>
            </View>

            {/* HISTORIAL DE VOZ */}
            <Text style={s.sectionTitle}>MONITOREO DE VOZ (POR USERNAME)</Text>
            {selPatient?.voiceHistory.map((v: any, i: number) => (
              <View key={i} style={s.voiceCard}>
                <Text style={s.voiceDate}>{new Date(v.timestamp).toLocaleDateString()}</Text>
                <Text style={s.voiceMain}>Riesgo: {v.risk}% | Fluidez: {v.ppm} ppm</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const IAResultCard = ({title, data, color}: any) => (
  <View style={{marginBottom: 15}}>
    <Text style={[s.sectionTitle, {color}]}>{title}</Text>
    <View style={[s.iaCard, {borderLeftColor: color}]}>
      {data ? (
        <>
          <Text style={[s.levelTag, {color}]}>{data.nivel.toUpperCase()}</Text>
          <Text style={s.iaText}>{data.prediccion}</Text>
        </>
      ) : <Text style={s.noData}>Prueba pendiente de realizar.</Text>}
    </View>
  </View>
);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.BG },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.IMSS_GREEN, padding: 25, paddingTop: 50 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  headerSub: { color: 'white', fontSize: 10, opacity: 0.8 },
  container: { padding: 15 },
  patientRow: { backgroundColor: 'white', borderRadius: 12, marginBottom: 10, flexDirection: 'row', height: 90, elevation: 2 },
  statusLine: { width: 8, height: '100%', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  patientInfo: { flex: 1, paddingLeft: 15, justifyContent: 'center' },
  patientId: { fontSize: 16, fontWeight: 'bold', color: COLORS.TEXT },
  patientNss: { fontSize: 11, color: '#999' },
  badgeRow: { flexDirection: 'row', marginTop: 6 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4 },
  badgeT: { color: 'white', fontSize: 8, fontWeight: 'bold' },
  rightInfo: { width: 70, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#F0F0F0' },
  voiceCount: { fontSize: 20, fontWeight: 'bold', color: COLORS.IMSS_GREEN },
  voiceLabel: { fontSize: 8, color: '#AAA' },
  modalRoot: { flex: 1, backgroundColor: COLORS.BG },
  modalHeader: { backgroundColor: COLORS.IMSS_GREEN, padding: 20, paddingTop: 50 },
  backBtn: { color: 'white', fontSize: 11, fontWeight: 'bold', marginBottom: 10 },
  modalTitle: { color: 'white', fontWeight: 'bold', fontSize: 22 },
  modalSub: { color: 'white', fontSize: 12, opacity: 0.8 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1, color: '#666' },
  iaCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, borderLeftWidth: 6, elevation: 2 },
  levelTag: { fontSize: 11, fontWeight: 'bold', marginBottom: 5 },
  iaText: { fontSize: 13, color: COLORS.TEXT, lineHeight: 19, fontStyle: 'italic' },
  voiceCard: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#EEE' },
  voiceDate: { fontSize: 9, color: '#999' },
  voiceMain: { fontSize: 13, fontWeight: '500', color: COLORS.TEXT },
  noData: { fontSize: 11, color: '#BBB', fontStyle: 'italic' }
});
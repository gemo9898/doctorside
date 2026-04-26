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
  BG: '#F0F3F3'
};

const FB_PROJECT = 'hack-441ef';
const AUDIOS_URL = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents/registro_audios`;
const USERS_URL = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents/usuarios`;

export default function DoctorOptimizedDashboard() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [selGroup, setSelGroup] = useState<any | null>(null);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [resAudios, resUsers] = await Promise.all([
        fetch(AUDIOS_URL),
        fetch(USERS_URL)
      ]);
      
      const dataAudios = await resAudios.json();
      const dataUsers = await resUsers.json();

      // 1. Crear Diccionario de Usuarios usando el EMAIL como llave
      const uMap: any = {};
      if (dataUsers.documents) {
        dataUsers.documents.forEach((doc: any) => {
          const f = doc.fields;
          // Normalizamos el email a minúsculas para evitar fallos de coincidencia
          const emailKey = f.email?.stringValue?.toLowerCase().trim();
          if (emailKey) {
            uMap[emailKey] = {
              name: f.username?.stringValue || "Paciente",
              nss: f.nss?.stringValue || "Sin NSS",
            };
          }
        });
      }

      // 2. Procesar Audios y vincular mediante la extracción del email del sessionId
      if (dataAudios.documents) {
        const transformed = dataAudios.documents.map((doc: any) => {
          const f = doc.fields;
          const sId = f.sessionId?.stringValue || "";
          
          /** * LÓGICA DE ENLACE:
           * Tu sessionId tiene el formato: "sesion_1777217738344_email@gmail.com"
           * El email empieza después de la segunda aparición del "_"
           */
          const parts = sId.split('_');
          const extractedEmail = parts.length >= 3 ? parts.slice(2).join('_').toLowerCase().trim() : "";
          
          // Buscamos en el mapa de usuarios
          const userData = uMap[extractedEmail];

          return {
            id: doc.name.split('/').pop(),
            userEmail: extractedEmail,
            userName: userData ? userData.name : (extractedEmail || "Anónimo"),
            userNss: userData ? userData.nss : "NSS no vinculado",
            risk: parseInt(f.indicadorRiesgo?.integerValue || "0"),
            ppm: parseInt(f.palabrasPorMinuto?.integerValue || "0"),
            afasia: parseInt(f.afasia?.mapValue?.fields?.indicador?.integerValue || "0"),
            congruencia: parseInt(f.congruencia?.mapValue?.fields?.puntuacion?.integerValue || "0"),
            timestamp: f.timestamp?.stringValue || new Date().toISOString(),
            status: parseInt(f.indicadorRiesgo?.integerValue || "0") > 60 ? 'CRITICO' : (parseInt(f.indicadorRiesgo?.integerValue || "0") > 30 ? 'SEGUIMIENTO' : 'ESTABLE')
          };
        });

        // Ordenar por fecha (descendente)
        transformed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecords(transformed);
      }
    } catch (e) {
      console.error("Error en enlace de datos:", e);
    } finally {
      setLoading(false);
    }
  };

  // Agrupamos por Email para la lista principal
  const grouped = records.reduce((acc: any, r: any) => {
    if (!acc[r.userEmail]) acc[r.userEmail] = [];
    acc[r.userEmail].push(r);
    return acc;
  }, {});

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.IMSS_GREEN} /></View>;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>CONTROL CLÍNICO POR EMAIL</Text>
          <Text style={s.headerSub}>Vinculación de Expediente y Análisis de Voz</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.labelTitle}>LISTADO DE PACIENTES VINCULADOS</Text>
        {Object.keys(grouped).map(email => {
          const sessions = grouped[email];
          const latest = sessions[0];
          const color = latest.status === 'CRITICO' ? COLORS.CRITICAL : (latest.status === 'SEGUIMIENTO' ? COLORS.WARNING : COLORS.STABLE);

          return (
            <TouchableOpacity key={email} style={s.patientRow} onPress={() => setSelGroup(sessions)}>
              <View style={[s.statusLine, {backgroundColor: color}]} />
              <View style={s.patientInfo}>
                <Text style={s.patientId}>{latest.userName}</Text>
                <Text style={s.patientSub}>{email}</Text>
                <Text style={s.nssTag}>NSS: {latest.userNss}</Text>
              </View>
              <View style={s.rightInfo}>
                <Text style={[s.riskNum, {color}]}>{latest.risk}%</Text>
                <Text style={s.riskLabel}>RIESGO</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* MODAL DETALLE */}
      <Modal visible={!!selGroup} animationType="slide">
        <View style={s.modalRoot}>
          <View style={[s.modalHeader, {backgroundColor: selGroup?.[0].status === 'CRITICO' ? COLORS.CRITICAL : COLORS.IMSS_GREEN}]}>
            <TouchableOpacity onPress={() => setSelGroup(null)}><Text style={s.backBtn}>✕</Text></TouchableOpacity>
            <View>
              <Text style={s.modalTitle}>{selGroup?.[0].userName}</Text>
              <Text style={s.modalEmail}>{selGroup?.[0].userEmail}</Text>
            </View>
          </View>

          <ScrollView style={{padding: 20}}>
             {selGroup?.map((sess: any, i: number) => (
              <View key={i} style={s.sessionCard}>
                <View style={s.sessionHeader}>
                  <Text style={s.sessionDate}>{new Date(sess.timestamp).toLocaleString()}</Text>
                </View>
                <View style={s.metricGrid}>
                  <CircleMetric lab="FLUIDEZ" val={sess.ppm} max={150} type="ppm" />
                  <CircleMetric lab="AFASIA" val={sess.afasia} max={100} type="score" />
                  <CircleMetric lab="CONGRU" val={sess.congruencia} max={100} type="score" />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// Componente visual de métricas
const CircleMetric = ({ lab, val, max, type }: any) => {
  const percentage = Math.min((val / max) * 100, 100);
  const color = type === 'ppm' 
    ? (val < 60 ? COLORS.CRITICAL : (val < 90 ? COLORS.WARNING : COLORS.STABLE))
    : (val > 50 ? COLORS.CRITICAL : (val > 25 ? COLORS.WARNING : COLORS.STABLE));

  return (
    <View style={s.cmRoot}>
      <View style={[s.cmCircle, { borderColor: '#EEE' }]}>
        <View style={[s.cmFillTrack, { 
            borderColor: color, 
            borderTopWidth: 4, 
            borderRightWidth: percentage > 25 ? 4 : 0,
            borderBottomWidth: percentage > 50 ? 4 : 0,
            borderLeftWidth: percentage > 75 ? 4 : 0,
        }]} />
        <Text style={[s.cmVal, { color }]}>{val}</Text>
      </View>
      <Text style={s.cmLab}>{lab}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.BG },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.IMSS_GREEN, padding: 25, paddingTop: 50 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  headerSub: { color: 'white', fontSize: 10, opacity: 0.8 },
  container: { padding: 15 },
  labelTitle: { fontSize: 11, fontWeight: 'bold', color: '#888', marginBottom: 15 },
  patientRow: { backgroundColor: 'white', borderRadius: 12, marginBottom: 10, flexDirection: 'row', height: 85, overflow: 'hidden', elevation: 2 },
  statusLine: { width: 6 },
  patientInfo: { flex: 1, justifyContent: 'center', paddingLeft: 15 },
  patientId: { fontSize: 15, fontWeight: 'bold', color: COLORS.TEXT },
  patientSub: { fontSize: 11, color: COLORS.IMSS_GOLD, fontWeight: '600' },
  nssTag: { fontSize: 10, color: '#999', marginTop: 2 },
  rightInfo: { width: 80, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#F0F0F0' },
  riskNum: { fontSize: 20, fontWeight: 'bold' },
  riskLabel: { fontSize: 8, color: '#999', fontWeight: 'bold' },
  modalRoot: { flex: 1, backgroundColor: COLORS.BG },
  modalHeader: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  backBtn: { color: 'white', fontSize: 20, marginRight: 20 },
  modalTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalEmail: { color: 'white', fontSize: 11, opacity: 0.8 },
  sessionCard: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15 },
  sessionHeader: { borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 10, marginBottom: 15 },
  sessionDate: { fontSize: 11, fontWeight: 'bold', color: '#666' },
  metricGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  cmRoot: { alignItems: 'center' },
  cmCircle: { width: 65, height: 65, borderRadius: 32.5, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  cmFillTrack: { position: 'absolute', width: 65, height: 65, borderRadius: 32.5, top: -2, left: -2 },
  cmVal: { fontSize: 16, fontWeight: 'bold' },
  cmLab: { fontSize: 8, fontWeight: 'bold', color: '#999', marginTop: 8 }
});
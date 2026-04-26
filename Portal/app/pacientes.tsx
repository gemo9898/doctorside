import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, TextInput, StatusBar, Modal, ActivityIndicator
} from 'react-native';

const C = { primary: '#1F5D50', secondary: '#287D6B', accent: '#B39656' };

// Estructura adaptada a los campos de tu JSON
type Patient = {
  id: string;
  name: string;
  email: string;
  nss: string;
  diaryEntries: number;
  exercisesCompleted: number;
  createdAt: string;
  onDime: boolean; // En este caso, lo simulamos si tienen ejercicios o según lógica de negocio
};

const USERS_URL = 'https://firestore.googleapis.com/v1/projects/hack-441ef/databases/(default)/documents/usuarios';

const INITIALS_COLORS = ['#1F5D50', '#287D6B', '#1565C0', '#6A1B9A', '#B71C1C', '#E65100', '#2E7D32'];

function getColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length];
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export default function PacientesScreen() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'todos' | 'activos' | 'nuevos'>('todos');
  const [sel, setSel] = useState<Patient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(USERS_URL);
      const data = await response.json();

      if (data.documents) {
        const mapped: Patient[] = data.documents.map((doc: any) => {
          const f = doc.fields;
          return {
            id: doc.name.split('/').pop(),
            name: f.username?.stringValue || 'Sin Nombre',
            email: f.email?.stringValue || '',
            nss: f.nss?.stringValue || 'N/A',
            diaryEntries: parseInt(f.diaryEntries?.integerValue || '0'),
            exercisesCompleted: parseInt(f.exercisesCompleted?.integerValue || '0'),
            createdAt: f.createdAt?.stringValue || '',
            // Definimos "onDime" si el usuario ya empezó a usar la app (ejercicios > 0)
            onDime: parseInt(f.exercisesCompleted?.integerValue || '0') > 0,
          };
        });
        setPatients(mapped);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter(p => {
    const match = p.name.toLowerCase().includes(query.toLowerCase()) ||
                  p.nss.includes(query) ||
                  p.email.toLowerCase().includes(query.toLowerCase());
    
    if (filter === 'activos') return match && p.onDime;
    if (filter === 'nuevos') return match && !p.onDime;
    return match;
  });

  const activeCount = patients.filter(p => p.onDime).length;

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={s.loadingTxt}>Cargando padrón de pacientes...</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* HEADER TIPO IMSS */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Directorio de Usuarios</Text>
          <Text style={s.headerSub}>Plataforma de Seguimiento Cognitivo</Text>
        </View>
        <View style={s.dimeBadgeSm}>
           <Text style={s.dimeBadgeSmTxt}>💙 {activeCount} Activos</Text>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por Nombre, NSS o Email..."
          placeholderTextColor="#AABBB8"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* FILTROS */}
      <View style={s.chipRow}>
        {(['todos', 'activos', 'nuevos'] as const).map(f => (
          <TouchableOpacity key={f} style={[s.chip, filter === f && s.chipSel]} onPress={() => setFilter(f)}>
            <Text style={[s.chipText, filter === f && s.chipTextSel]}>
              {f === 'todos' ? `Todos (${patients.length})` : f === 'activos' ? 'Con Actividad' : 'Sin Actividad'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.list}>
        {filtered.map(p => (
          <TouchableOpacity key={p.id} style={s.card} onPress={() => setSel(p)}>
            <View style={[s.avatar, { backgroundColor: getColor(p.id) }]}>
              <Text style={s.avatarTxt}>{initials(p.name)}</Text>
            </View>
            <View style={s.info}>
              <Text style={s.name}>{p.name}</Text>
              <Text style={s.diag}>{p.email}</Text>
              <Text style={s.meta}>NSS: {p.nss}</Text>
            </View>
            {p.onDime && (
              <View style={s.dimePill}>
                <Text style={s.dimePillTxt}>💙 Activo</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <Text style={s.footer}>SISTEMA DE GESTIÓN DE PACIENTES • 2026</Text>
      </ScrollView>

      {/* MODAL DE DETALLE */}
      <Modal visible={!!sel} transparent animationType="slide">
        {sel && (
          <View style={s.overlay}>
            <View style={s.modal}>
              <View style={s.modalProfile}>
                <View style={[s.modalAvatar, { backgroundColor: getColor(sel.id) }]}>
                  <Text style={s.modalAvatarTxt}>{initials(sel.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.modalName}>{sel.name}</Text>
                  <Text style={s.modalMeta}>Registrado el {new Date(sel.createdAt).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity onPress={() => setSel(null)}>
                  <Text style={{ fontSize: 22, color: '#CCC' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={s.statsGrid}>
                <View style={s.statBox}>
                  <Text style={s.statVal}>{sel.exercisesCompleted}</Text>
                  <Text style={s.statLab}>Ejercicios</Text>
                </View>
                <View style={s.statBox}>
                  <Text style={s.statVal}>{sel.diaryEntries}</Text>
                  <Text style={s.statLab}>Notas Diarias</Text>
                </View>
              </View>

              <View style={s.dataRow}><Text style={s.dataKey}>NSS</Text><Text style={s.dataVal}>{sel.nss}</Text></View>
              <View style={s.dataRow}><Text style={s.dataKey}>Email</Text><Text style={s.dataVal}>{sel.email}</Text></View>
              
              <TouchableOpacity style={s.closeBtn} onPress={() => setSel(null)}>
                <Text style={s.closeBtnTxt}>Regresar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F7F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7F6' },
  loadingTxt: { marginTop: 10, color: C.primary, fontWeight: 'bold' },
  header: { backgroundColor: C.primary, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  headerSub: { color: '#AABBB8', fontSize: 11 },
  dimeBadgeSm: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  dimeBadgeSmTxt: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  searchWrap: { flexDirection: 'row', backgroundColor: '#FFF', margin: 15, borderRadius: 12, padding: 12, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  chipRow: { flexDirection: 'row', paddingHorizontal: 15, gap: 10, marginBottom: 10 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#DDD' },
  chipSel: { backgroundColor: C.primary },
  chipText: { fontSize: 12, color: '#666', fontWeight: 'bold' },
  chipTextSel: { color: '#FFF' },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 1 },
  avatar: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#2D3A3A' },
  diag: { fontSize: 12, color: '#7F8C8D' },
  meta: { fontSize: 11, color: '#95A5A6', marginTop: 3 },
  dimePill: { backgroundColor: '#E8F4F1', padding: 5, borderRadius: 8 },
  dimePillTxt: { color: C.primary, fontSize: 10, fontWeight: 'bold' },
  footer: { textAlign: 'center', color: '#BDC3C7', fontSize: 10, fontWeight: 'bold', marginTop: 20, letterSpacing: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  modalProfile: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalAvatar: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  modalAvatarTxt: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  modalName: { fontSize: 18, fontWeight: 'bold', color: C.primary },
  modalMeta: { fontSize: 12, color: '#95A5A6' },
  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#F8F9F9', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  statVal: { fontSize: 20, fontWeight: 'bold', color: C.primary },
  statLab: { fontSize: 10, color: '#7F8C8D', fontWeight: 'bold', textTransform: 'uppercase' },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  dataKey: { color: '#95A5A6', fontSize: 13 },
  dataVal: { color: '#2D3A3A', fontSize: 13, fontWeight: 'bold' },
  closeBtn: { marginTop: 25, backgroundColor: C.primary, padding: 15, borderRadius: 12, alignItems: 'center' },
  closeBtnTxt: { color: '#FFF', fontWeight: 'bold' }
});
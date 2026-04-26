import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, TextInput, StatusBar, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const DAY_SIZE = Math.floor((width - 40) / 7);

const C = { primary: '#1F5D50', secondary: '#287D6B', accent: '#B39656', bg: '#FBFBFC' };

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const WDAYS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const TYPES  = ['Consulta General','Primera Consulta','Seguimiento','Urgencia','Control'];

type Appt = { id: string; patient: string; time: string; type: string };
type ApptMap = Record<string, Appt[]>;

const SEED: ApptMap = {
  '2026-04-26': [
    { id: '1', patient: 'María García',  time: '09:00', type: 'Consulta General' },
    { id: '2', patient: 'Roberto López', time: '10:30', type: 'Seguimiento' },
  ],
  '2026-04-28': [
    { id: '3', patient: 'Ana Ramos',     time: '11:00', type: 'Primera Consulta' },
  ],
  '2026-04-30': [
    { id: '4', patient: 'Jorge Medina',  time: '08:30', type: 'Control' },
    { id: '5', patient: 'Luis Mora',     time: '12:00', type: 'Urgencia' },
  ],
};

function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

const TYPE_COLORS: Record<string,string> = {
  'Consulta General': '#1F5D50',
  'Primera Consulta': '#287D6B',
  'Seguimiento':      '#B39656',
  'Urgencia':         '#D32F2F',
  'Control':          '#1565C0',
};

export default function CitasScreen() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selDay, setSelDay] = useState(today.getDate());
  const [appts, setAppts] = useState<ApptMap>(SEED);

  const [showModal, setShowModal] = useState(false);
  const [fPatient, setFPatient] = useState('');
  const [fTime,    setFTime]    = useState('');
  const [fType,    setFType]    = useState(TYPES[0]);

  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const selKey  = dateKey(year, month, selDay);
  const selAppts = appts[selKey] || [];

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
    setSelDay(1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
    setSelDay(1);
  }

  function addAppt() {
    if (!fPatient.trim() || !fTime.trim()) return;
    const newA: Appt = { id: Date.now().toString(), patient: fPatient.trim(), time: fTime.trim(), type: fType };
    setAppts(prev => ({ ...prev, [selKey]: [...(prev[selKey] || []), newA] }));
    setFPatient(''); setFTime(''); setFType(TYPES[0]);
    setShowModal(false);
  }

  function removeAppt(id: string) {
    setAppts(prev => ({ ...prev, [selKey]: (prev[selKey] || []).filter(a => a.id !== id) }));
  }

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Calendario de Citas</Text>
        <TouchableOpacity style={s.addFab} onPress={() => setShowModal(true)}>
          <Text style={s.addFabText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* ── MONTH NAV ── */}
        <View style={s.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={s.navBtn}>
            <Text style={s.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.monthLabel}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={s.navBtn}>
            <Text style={s.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── WEEK DAY HEADERS ── */}
        <View style={s.wdayRow}>
          {WDAYS.map(d => <Text key={d} style={s.wdayLabel}>{d}</Text>)}
        </View>

        {/* ── CALENDAR GRID ── */}
        <View style={s.calGrid}>
          {cells.map((day, i) => {
            if (!day) return <View key={`e${i}`} style={{ width: DAY_SIZE, height: DAY_SIZE }} />;
            const key     = dateKey(year, month, day);
            const hasDot  = !!(appts[key]?.length);
            const isSel   = day === selDay;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <TouchableOpacity
                key={i} style={[s.dayCell, isSel && s.daySel]}
                onPress={() => setSelDay(day)} activeOpacity={0.7}
              >
                <Text style={[s.dayNum, isSel && s.dayNumSel, isToday && !isSel && s.dayNumToday]}>
                  {day}
                </Text>
                {hasDot && <View style={[s.dot, isSel && { backgroundColor: '#FFF' }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── SELECTED DAY APPOINTMENTS ── */}
        <View style={s.apptSection}>
          <Text style={s.apptDateTitle}>
            {selDay} de {MONTHS[month]}, {year}
          </Text>

          {selAppts.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyIcon}>📭</Text>
              <Text style={s.emptyText}>Sin citas para este día</Text>
              <TouchableOpacity style={s.emptyAddBtn} onPress={() => setShowModal(true)}>
                <Text style={s.emptyAddText}>Agregar cita</Text>
              </TouchableOpacity>
            </View>
          ) : (
            selAppts
              .slice()
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(appt => (
                <View key={appt.id} style={s.apptCard}>
                  <View style={[s.apptBar, { backgroundColor: TYPE_COLORS[appt.type] || C.primary }]} />
                  <View style={s.apptTime}>
                    <Text style={s.apptTimeText}>{appt.time}</Text>
                  </View>
                  <View style={s.apptInfo}>
                    <Text style={s.apptPatient}>{appt.patient}</Text>
                    <Text style={s.apptType}>{appt.type}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeAppt(appt.id)} style={s.deleteBtn}>
                    <Text style={s.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
          )}
        </View>

      </ScrollView>

      {/* ── MODAL NUEVA CITA ── */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Nueva Cita</Text>
            <Text style={s.modalSub}>{selDay} de {MONTHS[month]}, {year}</Text>

            <Text style={s.label}>Paciente</Text>
            <TextInput
              style={s.input}
              placeholder="Nombre completo"
              placeholderTextColor="#AABBB8"
              value={fPatient}
              onChangeText={setFPatient}
            />

            <Text style={s.label}>Hora (HH:MM)</Text>
            <TextInput
              style={s.input}
              placeholder="ej. 10:30"
              placeholderTextColor="#AABBB8"
              value={fTime}
              onChangeText={setFTime}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={s.label}>Tipo de Consulta</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.typeChip, fType === t && s.typeChipSel]}
                  onPress={() => setFType(t)}
                >
                  <Text style={[s.typeChipText, fType === t && s.typeChipTextSel]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={s.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={addAppt}>
                <Text style={s.confirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FBFBFC' },

  header: {
    backgroundColor: '#1F5D50',
    paddingTop: 54, paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  addFab: {
    backgroundColor: '#B39656', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  addFabText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

  body: { paddingHorizontal: 20, paddingBottom: 50 },

  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 20,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    elevation: 2, shadowOpacity: 0.05,
  },
  navArrow: { fontSize: 24, color: '#1F5D50', fontWeight: 'bold', lineHeight: 28 },
  monthLabel: { fontSize: 17, fontWeight: '800', color: '#1F5D50' },

  wdayRow: { flexDirection: 'row', marginBottom: 8 },
  wdayLabel: {
    width: DAY_SIZE, textAlign: 'center',
    fontSize: 10, fontWeight: '700', color: '#AABBB8', letterSpacing: 0.5,
  },

  calGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  dayCell: {
    width: DAY_SIZE, height: DAY_SIZE,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: DAY_SIZE / 2,
  },
  daySel: { backgroundColor: '#1F5D50' },
  dayNum: { fontSize: 14, fontWeight: '600', color: '#334' },
  dayNumSel: { color: '#FFF', fontWeight: '800' },
  dayNumToday: { color: '#1F5D50', fontWeight: '900' },
  dot: {
    width: 5, height: 5, borderRadius: 3, backgroundColor: '#B39656',
    marginTop: 2,
  },

  apptSection: { paddingBottom: 20 },
  apptDateTitle: { fontSize: 16, fontWeight: '800', color: '#2D3A3A', marginBottom: 14 },

  emptyBox: { alignItems: 'center', paddingVertical: 30 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: '#AABBB8', fontWeight: '600', fontSize: 14 },
  emptyAddBtn: {
    marginTop: 14, backgroundColor: '#1F5D5015', borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  emptyAddText: { color: '#1F5D50', fontWeight: '700' },

  apptCard: {
    backgroundColor: '#FFF', borderRadius: 18, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
  },
  apptBar: { width: 5, alignSelf: 'stretch' },
  apptTime: {
    paddingHorizontal: 14, paddingVertical: 18,
    borderRightWidth: 1, borderRightColor: '#F0F0F0',
    minWidth: 64, alignItems: 'center',
  },
  apptTimeText: { fontSize: 13, fontWeight: '800', color: '#1F5D50' },
  apptInfo: { flex: 1, paddingHorizontal: 14 },
  apptPatient: { fontSize: 14, fontWeight: '700', color: '#2D3A3A' },
  apptType: { fontSize: 12, color: '#AABBB8', marginTop: 2 },
  deleteBtn: { paddingHorizontal: 16 },
  deleteIcon: { fontSize: 14, color: '#AABBB8' },

  // MODAL
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#FBFBFC', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 26, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1F5D50', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#AABBB8', marginBottom: 22 },
  label: { fontSize: 11, fontWeight: '800', color: '#889', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 14,
    fontSize: 15, color: '#334', marginBottom: 18,
    borderWidth: 1, borderColor: '#EAEFED',
  },
  typeChip: {
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#F0F0F0', marginRight: 8,
  },
  typeChipSel: { backgroundColor: '#1F5D50' },
  typeChipText: { fontSize: 12, fontWeight: '700', color: '#889' },
  typeChipTextSel: { color: '#FFF' },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, borderRadius: 16, paddingVertical: 16,
    backgroundColor: '#F0F0F0', alignItems: 'center',
  },
  cancelText: { fontWeight: '700', color: '#889' },
  confirmBtn: {
    flex: 2, borderRadius: 16, paddingVertical: 16,
    backgroundColor: '#1F5D50', alignItems: 'center',
  },
  confirmText: { fontWeight: '800', color: '#FFF', fontSize: 15 },
});
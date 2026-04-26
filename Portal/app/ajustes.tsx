import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Switch, StatusBar, Alert, Modal,
} from 'react-native';

const C = { primary: '#1F5D50', secondary: '#287D6B', accent: '#B39656', danger: '#C62828' };

interface ToggleRow { label: string; sub: string; icon: string; key: string }
interface ActionRow { label: string; icon: string; chevron?: boolean; danger?: boolean; onPress: () => void }

const TOGGLE_ITEMS: ToggleRow[] = [
  { key:'notif',   icon:'🔔', label:'Notificaciones',        sub:'Alertas de citas y expedientes' },
  { key:'biom',    icon:'🔒', label:'Biometría',             sub:'Touch ID / Face ID al iniciar' },
  { key:'sync',    icon:'🔄', label:'Sincronización en vivo',sub:'Actualizar datos en tiempo real' },
  { key:'offline', icon:'📶', label:'Modo sin conexión',     sub:'Guardar datos localmente' },
];

export default function AjustesScreen() {
  const [toggles, setToggles] = useState<Record<string,boolean>>({
    notif: true, biom: true, sync: false, offline: false,
  });
  const [showAbout, setShowAbout] = useState(false);

  function toggle(key: string) {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.') },
      ]
    );
  }

  const ACTIONS: ActionRow[] = [
    { icon:'🔐', label:'Cambiar contraseña',    chevron:true, onPress:() => Alert.alert('Cambiar contraseña','Funcionalidad disponible próximamente.') },
    { icon:'📋', label:'Términos y condiciones', chevron:true, onPress:() => Alert.alert('Términos','IMSS – Portal Médico v2.4.1\nTérminos y condiciones de uso institucional.') },
    { icon:'🛡️', label:'Privacidad de datos',   chevron:true, onPress:() => Alert.alert('Privacidad','Tus datos están protegidos bajo la Ley Federal de Protección de Datos Personales.') },
    { icon:'ℹ️', label:'Acerca del portal',     chevron:true, onPress:() => setShowAbout(true) },
    { icon:'🚪', label:'Cerrar sesión', danger:true, onPress:handleLogout },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Ajustes</Text>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* PROFILE CARD */}
        <View style={s.profileCard}>
          <View style={s.profileAvatarWrap}>
            <View style={s.profileAvatar}>
              <Text style={s.profileInitial}>P</Text>
            </View>
            <View style={s.onlineDot} />
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>Dr. Pérez Lozano</Text>
            <Text style={s.profileRole}>Médico General · UMF #47</Text>
            <Text style={s.profileNSS}>CURP: PELP700512HDFRZL02</Text>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={() => Alert.alert('Editar perfil','Disponible próximamente.')}>
            <Text style={s.editBtnTxt}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* STATS ROW */}
        <View style={s.statsRow}>
          {[
            { label:'Pacientes', value:'24' },
            { label:'Citas hoy', value:'12' },
            { label:'Alertas',   value:'3'  },
          ].map(item => (
            <View key={item.label} style={s.statBox}>
              <Text style={s.statValue}>{item.value}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* TOGGLES */}
        <Text style={s.sectionLabel}>Preferencias</Text>
        <View style={s.section}>
          {TOGGLE_ITEMS.map((item, i) => (
            <View key={item.key} style={[s.row, i < TOGGLE_ITEMS.length - 1 && s.rowBorder]}>
              <View style={s.rowIcon}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <View style={s.rowInfo}>
                <Text style={s.rowLabel}>{item.label}</Text>
                <Text style={s.rowSub}>{item.sub}</Text>
              </View>
              <Switch
                value={toggles[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: '#E0E0E0', true: C.primary + '80' }}
                thumbColor={toggles[item.key] ? C.primary : '#F5F5F5'}
              />
            </View>
          ))}
        </View>

        {/* SISTEMA */}
        <Text style={s.sectionLabel}>Sistema</Text>
        <View style={s.section}>
          {ACTIONS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[s.row, i < ACTIONS.length - 1 && s.rowBorder]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[s.rowIcon, item.danger && { backgroundColor: '#FFEBEE' }]}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <Text style={[s.rowLabel, { flex: 1 }, item.danger && { color: C.danger }]}>
                {item.label}
              </Text>
              {item.chevron && <Text style={s.chevron}>›</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* APP INFO */}
        <View style={s.appInfo}>
          <Text style={s.appInfoTxt}>Portal Médico IMSS</Text>
          <Text style={s.appInfoSub}>Versión 2.4.1 · Build 241</Text>
        </View>

        <Text style={s.footer}>PORTAL MÉDICO • IMSS 2026</Text>
      </ScrollView>

      {/* ABOUT MODAL */}
      <Modal visible={showAbout} transparent animationType="fade" onRequestClose={() => setShowAbout(false)}>
        <View style={s.overlay}>
          <View style={s.aboutModal}>
            <Text style={s.aboutLogo}>🏥</Text>
            <Text style={s.aboutTitle}>Portal Médico</Text>
            <Text style={s.aboutSub}>Instituto Mexicano del Seguro Social</Text>

            <View style={s.aboutDivider} />

            {[
              ['Versión',          '2.4.1'],
              ['Build',            '20260426'],
              ['Plataforma',       'Expo Go / iOS & Android'],
              ['Integración',      'Plataforma Dime'],
              ['Última actualización', '26 abril 2026'],
            ].map(([k, v]) => (
              <View key={k} style={s.aboutRow}>
                <Text style={s.aboutKey}>{k}</Text>
                <Text style={s.aboutVal}>{v}</Text>
              </View>
            ))}

            <Text style={s.aboutNote}>
              Sistema de uso exclusivo para personal médico autorizado del IMSS. 
              El acceso no autorizado está prohibido.
            </Text>

            <TouchableOpacity style={s.aboutClose} onPress={() => setShowAbout(false)}>
              <Text style={s.aboutCloseTxt}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FBFBFC' },

  header: {
    backgroundColor: '#1F5D50', paddingTop: 54, paddingBottom: 18,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },

  body: { paddingHorizontal: 16, paddingBottom: 50 },

  // PROFILE
  profileCard: {
    backgroundColor: '#FFF', borderRadius: 22, padding: 18, marginTop: 16, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center',
    elevation: 3, shadowColor: '#1F5D50', shadowOpacity: 0.08, shadowRadius: 10,
  },
  profileAvatarWrap: { position: 'relative', marginRight: 14 },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: '#1F5D50',
    justifyContent: 'center', alignItems: 'center',
  },
  profileInitial: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7, backgroundColor: '#4CAF50',
    borderWidth: 2, borderColor: '#FFF',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '800', color: '#1F5D50' },
  profileRole: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  profileNSS: { fontSize: 10, color: '#AABBB8', marginTop: 3, fontFamily: 'monospace' },
  editBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
  },
  editBtnTxt: { fontSize: 16 },

  // STATS
  statsRow: {
    flexDirection: 'row', gap: 10, marginBottom: 20,
  },
  statBox: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 14, alignItems: 'center',
    elevation: 1, shadowOpacity: 0.03,
  },
  statValue: { fontSize: 22, fontWeight: '900', color: '#1F5D50' },
  statLabel: { fontSize: 10, color: '#AABBB8', fontWeight: '700', marginTop: 2, textAlign: 'center' },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#889',
    letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10,
  },

  section: {
    backgroundColor: '#FFF', borderRadius: 20, marginBottom: 22,
    overflow: 'hidden', elevation: 1, shadowOpacity: 0.03,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: '#2D3A3A' },
  rowSub: { fontSize: 11, color: '#AABBB8', marginTop: 1 },
  chevron: { fontSize: 20, color: '#AABBB8', fontWeight: '600' },

  appInfo: {
    alignItems: 'center', marginBottom: 10,
    paddingVertical: 14, backgroundColor: '#FFF',
    borderRadius: 16,
  },
  appInfoTxt: { fontSize: 13, fontWeight: '700', color: '#7F8C8D' },
  appInfoSub: { fontSize: 11, color: '#AABBB8', marginTop: 3 },

  footer: {
    textAlign: 'center', marginTop: 20, fontSize: 10,
    color: '#BDC3C7', fontWeight: 'bold', letterSpacing: 2,
  },

  // ABOUT MODAL
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  aboutModal: {
    backgroundColor: '#FBFBFC', borderRadius: 28, padding: 28,
    width: '100%', alignItems: 'center',
  },
  aboutLogo: { fontSize: 48, marginBottom: 10 },
  aboutTitle: { fontSize: 22, fontWeight: '900', color: '#1F5D50' },
  aboutSub: { fontSize: 13, color: '#7F8C8D', marginTop: 4, marginBottom: 18, textAlign: 'center' },
  aboutDivider: { width: '100%', height: 1, backgroundColor: '#F0F0F0', marginBottom: 16 },
  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  aboutKey: { fontSize: 12, color: '#AABBB8', fontWeight: '600' },
  aboutVal: { fontSize: 12, color: '#2D3A3A', fontWeight: '700' },
  aboutNote: {
    fontSize: 11, color: '#AABBB8', textAlign: 'center',
    marginTop: 16, lineHeight: 17, paddingHorizontal: 10,
  },
  aboutClose: {
    marginTop: 20, backgroundColor: '#1F5D50', borderRadius: 14,
    paddingHorizontal: 40, paddingVertical: 14,
  },
  aboutCloseTxt: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});
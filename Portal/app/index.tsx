import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Dimensions, StatusBar,
} from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - 14) / 2;

const C = {
  primary: '#1F5D50',
  secondary: '#287D6B',
  accent: '#B39656',
  bg: '#FBFBFC',
};

interface CardProps { title: string; icon: string; color: string; route: string; subtitle: string }

function ActionCard({ title, icon, color, route, subtitle }: CardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      activeOpacity={0.75}
      onPress={() => router.push(route as any)}
    >
      <View style={[styles.iconWrapper, { backgroundColor: color + '18' }]}>
        <Text style={styles.cardIcon}>{icon}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.miniAvatar}>
            <Text style={styles.avatarLetter}>P</Text>
          </View>
          <View>
            <Text style={styles.drLabel}>Dr. Pérez Lozano</Text>
            <Text style={styles.statusLabel}>● Consultorio Activo</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBadge}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER */}
        <View style={styles.summaryBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Progreso del Día</Text>
            <Text style={styles.summarySub}>8 de 12 pacientes atendidos</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '75%' }]} />
            </View>
          </View>
          <View style={styles.percentBox}>
            <Text style={styles.percentText}>75%</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Servicios Médicos</Text>

        {/* 2x2 GRID */}
        <View style={styles.grid}>
          <ActionCard title="Pacientes" icon="👥" color={C.primary} route="/pacientes" subtitle="24 activos" />
          <ActionCard title="Citas" icon="📅" color={C.primary} route="/citas" subtitle="5 hoy" />
          <ActionCard title="Expediente" icon="📂" color={C.secondary} route="/expediente" subtitle="3 alertas" />
          <ActionCard title="Ajustes" icon="⚙️" color="#6B7B8D" route="/ajustes" subtitle="Configurar" />
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Últimos Movimientos</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View style={styles.activityBullet} />
            <Text style={styles.activityText}>Expediente de Luis Mora actualizado</Text>
            <Text style={styles.activityTime}>10m</Text>
          </View>
          <View style={[styles.activityRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.activityBullet, { backgroundColor: C.accent }]} />
            <Text style={styles.activityText}>Cita programada: Ana Ramos</Text>
            <Text style={styles.activityTime}>25m</Text>
          </View>
        </View>

        <Text style={styles.footerBrand}>PORTAL MÉDICO • IMSS 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#FBFBFC' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20,
  },
  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#1F5D50',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarLetter: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  drLabel: { fontSize: 17, fontWeight: '800', color: '#1F5D50' },
  statusLabel: { fontSize: 11, color: '#4CAF50', fontWeight: '700' },
  notifBadge: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', elevation: 3, shadowOpacity: 0.06,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#D32F2F',
    position: 'absolute', top: 10, right: 10,
  },
  scrollBody: { paddingHorizontal: 20, paddingBottom: 50 },
  summaryBanner: {
    backgroundColor: '#1F5D50', borderRadius: 24, padding: 22,
    flexDirection: 'row', alignItems: 'center', marginBottom: 28,
    elevation: 6, shadowColor: '#1F5D50', shadowOpacity: 0.25, shadowRadius: 12,
  },
  summaryTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  summarySub: { color: '#B3CEC8', fontSize: 13, marginBottom: 12 },
  progressBarBg: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#B39656', borderRadius: 3 },
  percentBox: { marginLeft: 20, alignItems: 'center' },
  percentText: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#889', marginBottom: 16,
    textTransform: 'uppercase', letterSpacing: 1.8,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20, gap: 14 },
  card: {
    backgroundColor: '#FFF', borderRadius: 22, paddingVertical: 20,
    paddingHorizontal: 14, marginBottom: 0, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8,
  },
  iconWrapper: {
    width: 52, height: 52, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  cardIcon: { fontSize: 24 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#2D3A3A', textAlign: 'center' },
  cardSub: { fontSize: 11, color: '#AABBB8', fontWeight: '600', marginTop: 3 },
  activityCard: { backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', elevation: 1 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  activityBullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1F5D50', marginRight: 12 },
  activityText: { flex: 1, fontSize: 13, color: '#556' },
  activityTime: { fontSize: 11, color: '#AAA' },
  footerBrand: {
    textAlign: 'center', marginTop: 36, fontSize: 10,
    color: '#BDC3C7', fontWeight: 'bold', letterSpacing: 2.5,
  },
});
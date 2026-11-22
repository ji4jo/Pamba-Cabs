import React, { useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, StatusBar
} from "react-native";

const GOLD = "#D6B46A";
const BG = "#090909";
const PANEL = "#171717";
const MUTED = "#A7A7A7";

const initialVehicles = [
  { id: "v1", name: "Maruti Suzuki Innova", category: "SUV", seats: 7, reg: "Add registration", rate: 22, active: true },
  { id: "v2", name: "Chevrolet Tavera", category: "SUV", seats: 7, reg: "Add registration", rate: 18, active: true },
  { id: "v3", name: "Hyundai Aura", category: "Sedan", seats: 4, reg: "Add registration", rate: 15, active: true },
];
const initialDrivers = [
  { id: "d1", name: "Driver 1", phone: "Add phone number", active: true },
  { id: "d2", name: "Driver 2", phone: "Add phone number", active: true },
];

function Button({ title, onPress, secondary = false }) {
  return <TouchableOpacity onPress={onPress} style={[styles.button, secondary && styles.secondaryButton]}>
    <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text>
  </TouchableOpacity>;
}
function Field({ label, value, onChangeText, placeholder, keyboardType }) {
  return <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder || label}
      placeholderTextColor="#777" keyboardType={keyboardType} style={styles.input} />
  </View>;
}
function Tag({ children }) { return <Text style={styles.tag}>{children}</Text>; }

export default function App() {
  const [tab, setTab] = useState("Home");
  const [role, setRole] = useState("Customer");
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [bookings, setBookings] = useState([]);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("v1");
  const [newVehicle, setNewVehicle] = useState({ name: "", category: "SUV", seats: "4", reg: "", rate: "" });
  const [newDriver, setNewDriver] = useState({ name: "", phone: "" });

  const activeVehicles = vehicles.filter(v => v.active);
  const selected = vehicles.find(v => v.id === selectedVehicle) || activeVehicles[0];
  const activeDrivers = drivers.filter(d => d.active);

  const createBooking = () => {
    if (!pickup.trim() || !drop.trim() || !date.trim() || !selected) {
      Alert.alert("Missing details", "Please enter pickup, destination and journey date.");
      return;
    }
    const booking = {
      id: "PC" + String(Date.now()).slice(-6), pickup, drop, date,
      vehicleId: selected.id, vehicleName: selected.name, fare: selected.rate,
      status: "Pending", driverId: null
    };
    setBookings(prev => [booking, ...prev]);
    setPickup(""); setDrop(""); setDate("");
    Alert.alert("Booking request received", "Pamba Cabs will confirm your booking and assign a driver.");
    setTab("My Bookings");
  };

  const assignDriver = (bookingId, driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    setBookings(prev => prev.map(b => b.id === bookingId
      ? { ...b, driverId, driverName: driver?.name || "Driver", status: "Assigned" } : b));
  };

  const addVehicle = () => {
    if (!newVehicle.name.trim() || !newVehicle.rate.trim()) {
      Alert.alert("Required", "Enter vehicle name and rate per km.");
      return;
    }
    setVehicles(prev => [...prev, {
      id: "v" + Date.now(), name: newVehicle.name, category: newVehicle.category,
      seats: Number(newVehicle.seats) || 4, reg: newVehicle.reg || "Add registration",
      rate: Number(newVehicle.rate), active: true
    }]);
    setNewVehicle({ name: "", category: "SUV", seats: "4", reg: "", rate: "" });
    Alert.alert("Vehicle added", "The vehicle is now available in the fleet list.");
  };

  const addDriver = () => {
    if (!newDriver.name.trim() || !newDriver.phone.trim()) {
      Alert.alert("Required", "Enter driver name and phone number.");
      return;
    }
    setDrivers(prev => [...prev, { id: "d" + Date.now(), ...newDriver, active: true }]);
    setNewDriver({ name: "", phone: "" });
  };

  const toggleVehicle = id => setVehicles(prev => prev.map(v => v.id === id ? { ...v, active: !v.active } : v));
  const toggleDriver = id => setDrivers(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));

  const nav = role === "Customer"
    ? ["Home", "My Bookings", "Fleet"]
    : role === "Driver"
      ? ["Driver Trips", "Profile"]
      : ["Dashboard", "Bookings", "Vehicles", "Drivers"];

  const changeRole = r => { setRole(r); setTab(r === "Customer" ? "Home" : r === "Driver" ? "Driver Trips" : "Dashboard"); };

  const Card = ({ children }) => <View style={styles.card}>{children}</View>;
  const Heading = ({ children }) => <Text style={styles.heading}>{children}</Text>;

  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="light-content" backgroundColor={BG} />
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>PAMBA CABS</Text>
        <Text style={styles.tagline}>YOUR JOURNEY. YOUR TRUST.</Text>
      </View>
      <Text style={styles.headerMark}>PC</Text>
    </View>

    <View style={styles.roleRow}>
      {["Customer", "Driver", "Admin"].map(r =>
        <TouchableOpacity key={r} onPress={() => changeRole(r)} style={[styles.role, role === r && styles.roleActive]}>
          <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r}</Text>
        </TouchableOpacity>
      )}
    </View>

    <ScrollView contentContainerStyle={styles.content}>
      {tab === "Home" && <>
        <Text style={styles.heroTitle}>Book your next ride.</Text>
        <Text style={styles.muted}>Reliable journeys from Pathanamthitta and beyond.</Text>
        <Card>
          <Heading>Where would you like to go?</Heading>
          <Field label="Pickup location" value={pickup} onChangeText={setPickup} />
          <Field label="Drop location" value={drop} onChangeText={setDrop} />
          <Field label="Journey date" value={date} onChangeText={setDate} placeholder="DD-MM-YYYY" />
          <Text style={styles.label}>Choose your vehicle</Text>
          {activeVehicles.map(v => <TouchableOpacity key={v.id} onPress={() => setSelectedVehicle(v.id)}
            style={[styles.choice, selectedVehicle === v.id && styles.choiceSelected]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{v.name}</Text>
              <Text style={styles.mutedSmall}>{v.category} · {v.seats} seats · ₹{v.rate}/km</Text>
            </View>
            <Text style={styles.gold}>{selectedVehicle === v.id ? "✓ Selected" : "Select"}</Text>
          </TouchableOpacity>)}
          <Button title="REQUEST BOOKING" onPress={createBooking} />
          <Text style={styles.note}>Your request is sent to the owner for manual confirmation and driver assignment.</Text>
        </Card>
        <Card>
          <Heading>Need help?</Heading>
          <Text style={styles.body}>Call or WhatsApp: +91 87144 18524</Text>
          <Text style={styles.mutedSmall}>Pathanamthitta, Kerala</Text>
        </Card>
      </>}

      {tab === "My Bookings" && <>
        <Heading>My Bookings</Heading>
        {bookings.length === 0 ? <Card><Text style={styles.muted}>No booking requests yet.</Text></Card> : bookings.map(b =>
          <Card key={b.id}>
            <View style={styles.rowBetween}><Text style={styles.itemTitle}>{b.id}</Text><Tag>{b.status}</Tag></View>
            <Text style={styles.body}>{b.pickup} → {b.drop}</Text>
            <Text style={styles.mutedSmall}>{b.date} · {b.vehicleName}</Text>
            <Text style={styles.gold}>Indicative rate: ₹{b.fare}/km</Text>
            {b.driverName && <Text style={styles.body}>Assigned driver: {b.driverName}</Text>}
          </Card>)}
      </>}

      {tab === "Fleet" && <>
        <Heading>Our Fleet</Heading>
        {activeVehicles.map(v => <Card key={v.id}><Text style={styles.itemTitle}>{v.name}</Text>
          <Text style={styles.mutedSmall}>{v.category} · {v.seats} seats · ₹{v.rate}/km</Text></Card>)}
      </>}

      {tab === "Dashboard" && <>
        <Heading>Owner Dashboard</Heading>
        <View style={styles.stats}>
          <Card><Text style={styles.stat}>{bookings.length}</Text><Text style={styles.mutedSmall}>Bookings</Text></Card>
          <Card><Text style={styles.stat}>{activeDrivers.length}</Text><Text style={styles.mutedSmall}>Active drivers</Text></Card>
          <Card><Text style={styles.stat}>{activeVehicles.length}</Text><Text style={styles.mutedSmall}>Vehicles</Text></Card>
        </View>
        <Card><Heading>Business details</Heading><Text style={styles.body}>Pamba Cabs · Pathanamthitta</Text><Text style={styles.body}>+91 87144 18524</Text><Text style={styles.mutedSmall}>Manual booking approval and driver assignment</Text></Card>
      </>}

      {tab === "Bookings" && <>
        <Heading>Manage Bookings</Heading>
        {bookings.length === 0 ? <Card><Text style={styles.muted}>No bookings received in this demo yet. Create one from Customer mode.</Text></Card> : bookings.map(b =>
          <Card key={b.id}>
            <View style={styles.rowBetween}><Text style={styles.itemTitle}>{b.id}</Text><Tag>{b.status}</Tag></View>
            <Text style={styles.body}>{b.pickup} → {b.drop}</Text>
            <Text style={styles.mutedSmall}>{b.date} · {b.vehicleName} · ₹{b.fare}/km</Text>
            <Text style={styles.label}>Assign driver</Text>
            {activeDrivers.map(d => <Button key={d.id} secondary title={`Assign ${d.name}`} onPress={() => assignDriver(b.id, d.id)} />)}
            {b.driverName && <Text style={styles.gold}>Assigned to {b.driverName}</Text>}
          </Card>)}
      </>}

      {tab === "Vehicles" && <>
        <Heading>Vehicle Management</Heading>
        {vehicles.map(v => <Card key={v.id}>
          <View style={styles.rowBetween}><Text style={styles.itemTitle}>{v.name}</Text><Tag>{v.active ? "Active" : "Inactive"}</Tag></View>
          <Text style={styles.mutedSmall}>{v.category} · {v.seats} seats · {v.reg}</Text>
          <Text style={styles.gold}>₹{v.rate}/km</Text>
          <Button secondary title={v.active ? "Deactivate vehicle" : "Activate vehicle"} onPress={() => toggleVehicle(v.id)} />
        </Card>)}
        <Card>
          <Heading>Add a future vehicle</Heading>
          <Field label="Vehicle name" value={newVehicle.name} onChangeText={t => setNewVehicle(p => ({ ...p, name: t }))} />
          <Field label="Category (SUV / Sedan / Hatchback)" value={newVehicle.category} onChangeText={t => setNewVehicle(p => ({ ...p, category: t }))} />
          <Field label="Seating capacity" value={newVehicle.seats} onChangeText={t => setNewVehicle(p => ({ ...p, seats: t }))} keyboardType="numeric" />
          <Field label="Registration number" value={newVehicle.reg} onChangeText={t => setNewVehicle(p => ({ ...p, reg: t }))} />
          <Field label="Rate per km (₹)" value={newVehicle.rate} onChangeText={t => setNewVehicle(p => ({ ...p, rate: t }))} keyboardType="numeric" />
          <Button title="ADD VEHICLE" onPress={addVehicle} />
        </Card>
      </>}

      {tab === "Drivers" && <>
        <Heading>Driver Management</Heading>
        {drivers.map(d => <Card key={d.id}>
          <View style={styles.rowBetween}><Text style={styles.itemTitle}>{d.name}</Text><Tag>{d.active ? "Active" : "Inactive"}</Tag></View>
          <Text style={styles.mutedSmall}>{d.phone}</Text>
          <Button secondary title={d.active ? "Deactivate driver" : "Activate driver"} onPress={() => toggleDriver(d.id)} />
        </Card>)}
        <Card>
          <Heading>Add driver</Heading>
          <Field label="Driver name" value={newDriver.name} onChangeText={t => setNewDriver(p => ({ ...p, name: t }))} />
          <Field label="Phone number" value={newDriver.phone} onChangeText={t => setNewDriver(p => ({ ...p, phone: t }))} keyboardType="phone-pad" />
          <Button title="ADD DRIVER" onPress={addDriver} />
        </Card>
      </>}

      {tab === "Driver Trips" && <>
        <Heading>Driver Portal</Heading>
        <Card><Text style={styles.muted}>Demo driver view. Production version will use secure individual driver accounts and show only trips assigned to the signed-in driver.</Text></Card>
        {bookings.filter(b => b.driverId).map(b => <Card key={b.id}>
          <Text style={styles.itemTitle}>{b.id}</Text><Text style={styles.body}>{b.pickup} → {b.drop}</Text>
          <Text style={styles.mutedSmall}>{b.date} · {b.status}</Text>
        </Card>)}
      </>}

      {tab === "Profile" && <Card><Heading>Driver Profile</Heading><Text style={styles.muted}>Individual driver sign-in and profile management will be connected in the production backend.</Text></Card>}
    </ScrollView>

    <View style={styles.bottomNav}>
      {nav.map(n => <TouchableOpacity key={n} onPress={() => setTab(n)} style={styles.navItem}>
        <Text style={[styles.navText, tab === n && styles.navTextActive]}>{n}</Text>
      </TouchableOpacity>)}
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#292929" },
  brand: { color: GOLD, fontSize: 23, fontWeight: "900", letterSpacing: 2 },
  tagline: { color: "#E4E4E4", fontSize: 9, letterSpacing: 2, marginTop: 3 },
  headerMark: { color: GOLD, borderWidth: 1, borderColor: GOLD, borderRadius: 22, padding: 9, fontWeight: "800" },
  roleRow: { flexDirection: "row", padding: 10, gap: 8, backgroundColor: "#101010" },
  role: { flex: 1, borderRadius: 8, paddingVertical: 9, alignItems: "center", borderWidth: 1, borderColor: "#343434" },
  roleActive: { backgroundColor: GOLD, borderColor: GOLD },
  roleText: { color: "#DDD", fontWeight: "600", fontSize: 12 },
  roleTextActive: { color: "#111" },
  content: { padding: 16, paddingBottom: 28 },
  heroTitle: { color: "#FFF", fontSize: 27, fontWeight: "800", marginTop: 6 },
  muted: { color: MUTED, fontSize: 13, lineHeight: 19, marginTop: 5 },
  mutedSmall: { color: MUTED, fontSize: 11, marginTop: 5 },
  card: { backgroundColor: PANEL, borderRadius: 14, padding: 15, marginTop: 13, borderWidth: 1, borderColor: "#292929", flex: 1 },
  heading: { color: GOLD, fontSize: 17, fontWeight: "800", marginBottom: 12 },
  label: { color: "#E4E4E4", fontSize: 12, fontWeight: "700", marginBottom: 6, marginTop: 3 },
  input: { backgroundColor: "#0D0D0D", borderWidth: 1, borderColor: "#383838", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, color: "#FFF", fontSize: 14 },
  choice: { flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, borderColor: "#333", borderRadius: 9, marginBottom: 8 },
  choiceSelected: { borderColor: GOLD, backgroundColor: "#242015" },
  itemTitle: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  gold: { color: GOLD, fontWeight: "700", marginTop: 7, fontSize: 12 },
  button: { backgroundColor: GOLD, borderRadius: 9, paddingVertical: 12, paddingHorizontal: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#111", fontWeight: "900", fontSize: 12, letterSpacing: 0.7 },
  secondaryButton: { backgroundColor: "#242424", borderWidth: 1, borderColor: "#555", marginTop: 8 },
  secondaryButtonText: { color: GOLD },
  note: { color: MUTED, fontSize: 10, marginTop: 10, lineHeight: 15 },
  body: { color: "#EEE", fontSize: 13, marginTop: 6, lineHeight: 19 },
  tag: { color: GOLD, backgroundColor: "#2B2518", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, overflow: "hidden", fontSize: 10, fontWeight: "700" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stats: { flexDirection: "row", gap: 8 },
  stat: { color: GOLD, fontSize: 24, fontWeight: "900" },
  bottomNav: { flexDirection: "row", backgroundColor: "#121212", borderTopWidth: 1, borderTopColor: "#303030", paddingVertical: 12, paddingHorizontal: 4, justifyContent: "space-around" },
  navItem: { paddingHorizontal: 4 },
  navText: { color: MUTED, fontSize: 10, fontWeight: "600" },
  navTextActive: { color: GOLD, fontWeight: "900" },
});

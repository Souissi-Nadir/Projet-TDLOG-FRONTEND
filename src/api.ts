//---------PAGE QUI COMMUNIQUE BACK et FRONT-------//

//Récupération des fonctions d'autorisations avec le token
import { clearAuthToken, getAuthToken, setAuthToken } from "./auth";

//URL en local
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;



// Fonction générique pour les requêtes : le moteur de tous les appels API
async function request(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`; //Ajoute l'autorisation si token JWT présent
  }

  const res = await fetch(`${BACKEND_URL}${path}`, { //requete http
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) { //token JWT invalide on déconnecte en supprimant le token
    clearAuthToken();
  }

  if (!res.ok) { //requete a échoué
    const errorText = await res.text();
    throw new Error(`Erreur API ${res.status} : ${errorText}`);
  }

  if (res.status === 204) { //requete sans contenu
    return null;
  }

  return res.json(); //sinon on renvoie l'objet json de la requete
}

// ON DEF TOUTES LES REQUETES UNE PAR UNE 
// -------------------------
//        HEALTH (verifie la bonne question back front )
// -------------------------
export async function getHealth() {
  return request("/");
}

// -------------------------
//        AUTH
// -------------------------
export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type SignupPayload = {
  email: string;
  name?: string;
  password: string;
};

export type User = {
  id: number;
  email: string;
  name?: string | null;
  is_superadmin: boolean;
};

export async function getMe(): Promise<User> {
  return request("/auth/me");
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const data = await request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username,
      password,
    }),
  });
  setAuthToken(data.access_token);
  return data;
}

export async function signup(payload: SignupPayload): Promise<User> {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout(): void {
  clearAuthToken();
}

// -------------------------
//        EVENTS
// -------------------------

export type Event = {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
};

export type EventAdmin = {
  user_id: number;
  user_email: string;
  user_name: string | null;
  role: string;
};

export async function getEvents() {
  return request("/events/");
}

export async function getEvent(eventId: number) {
  return request(`/events/${eventId}`);
}

export async function createEvent(data: any) {
  return request("/events/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEvent(eventId: number, data: Partial<Omit<Event, 'id'>>) {
  return request(`/events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(eventId: number) {
  return request(`/events/${eventId}`, {
    method: "DELETE",
  });
}

export async function addEventAdmin(
  eventId: number,
  userEmail: string,
  role: "OWNER" | "SCANNER_ONLY" = "SCANNER_ONLY"
): Promise<EventAdmin> {
  return request(`/events/${eventId}/admins/`, {
    method: "POST",
    body: JSON.stringify({ user_email: userEmail, role }),
  });
}

// -------------------------
//        PARTICIPANTS
// -------------------------

export type EventParticipant = {
  id: number;
  event_id: number;
  first_name: string;
  last_name: string;
  promo?: string | null;
  email?: string | null;
  tarif?: string | null;
  qr_code: string;
  status?: string | null;
  scanned_at?: string | null;
};

export type EventParticipantPayload = {
  first_name: string;
  last_name: string;
  promo?: string;
  email?: string;
  tarif?: string;
};

export async function getEventParticipants(eventId: number) {
  return request(`/events/${eventId}/participants/`);
}

export async function createEventParticipant(
  eventId: number,
  payload: EventParticipantPayload
) {
  return request(`/events/${eventId}/participants/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEventParticipant(
  eventId: number,
  participantId: number,
  payload: Partial<EventParticipantPayload>
) {
  return request(`/events/${eventId}/participants/${participantId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteEventParticipant(eventId: number, participantId: number) {
  return request(`/events/${eventId}/participants/${participantId}`, {
    method: "DELETE",
  });
}

// -------------------------
//        TICKETS
// -------------------------
export type EventTicket = {
  id: number;
  event_id: number;
  user_email: string | null;
  user_name: string;
  qr_code_token: string;
  status: string;
  scanned_at: string | null;
};

export async function getEventTickets(eventId: number) {
  return request(`/events/${eventId}/tickets`);
}

export async function createTicket(eventId: number, payload: any) {
  return request(`/events/${eventId}/tickets`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// -------------------------
//        SCAN
// -------------------------
export async function scanTicket(token: string) {
  return request("/scan", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

// -------------------------
//        STUDENTS (BASE DE DONNÉE)
// -------------------------

export type Student = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_external: boolean;
};

export type StudentCreate = {
  first_name: string;
  last_name: string;
  email: string;
  is_external?: boolean;
};

// Récupérer tous les élèves (pour l'événement "Base de donnée")
export async function getStudents(): Promise<Student[]> {
  return request("/students/");
}

// Recherche pour l'autocomplétion (nom / prénom / email)
export async function searchStudents(q: string): Promise<Student[]> {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return request(`/students/search${query}`);
}

// Créer un élève dans la base (si pas déjà présent)
export async function createStudent(
  payload: StudentCreate
): Promise<Student | null> {
  try {
    return await request("/students/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (e: any) {
    // si l'API renvoie 400 "Email déjà enregistré", on renvoie null
    if (typeof e.message === "string" && e.message.includes("400")) {
      return null;
    }
    throw e;
  }
}
export type CurrentUser = {
  id: number;
  email: string;
  name: string;
  is_superadmin: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  return request("/auth/me");
}

//PAGE QUI COMMUNIQUE AVEC LE FRONTEND, NE PAS MODIFIER SANS PARLER AVEC ARTHUR


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

// Fonction générique pour les requêtes
async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur API ${res.status} : ${errorText}`);
  }

  return res.json();
}

// -------------------------
//        HEALTH (verifie le bon fonctionnement)
// -------------------------
export async function getHealth() {
  return request("/");
}

// -------------------------
//        AUTH
// -------------------------
export async function login(username: string, password: string) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
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

export async function getEvents() {
  return request("/events");
}

export async function getEvent(eventId: number) {
  return request(`/events/${eventId}`);
}

export async function createEvent(data: any) {
  return request("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// -------------------------
//        TICKETS
// -------------------------
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
  return request("/students");
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
    return await request("/students", {
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

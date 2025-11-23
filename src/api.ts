
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

// Petite fonction utilitaire pour gérer les erreurs proprement
async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    // Tu peux logger ou afficher un message plus tard
    throw new Error(`Erreur API ${res.status}`);
  }

  // Si tu sais que le backend renvoie du JSON
  return res.json();
}

// Exemple : appel de la route /health
export async function getHealth() {
  return request("/health");
}

// Tu pourras ensuite ajouter des fonctions du style :
// export async function createTicket(data: TicketPayload) { ... }
// export async function scanTicket(qrCode: string) { ... }

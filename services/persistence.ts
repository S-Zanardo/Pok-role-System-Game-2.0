import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { PokemonCharacter } from "../types";
import { TrainerData, createInitialTrainer } from "../utils";

// Definisci l'interfaccia dei dati che vuoi salvare
export interface UserData {
  party: (PokemonCharacter | null)[];
  pcBoxes: (PokemonCharacter | null)[][];
  trainer?: TrainerData;
}

/**
 * Salva i dati dell'utente su Firestore.
 * @param userId L'UID dell'utente loggato (da auth.currentUser.uid)
 * @param data L'oggetto contenente party e pc
 */
export const saveUserData = async (userId: string, data: UserData) => {
  if (!userId) return;
  
  try {
    // Crea/Aggiorna il documento nella collezione 'users' con l'ID dell'utente
    // Rimuovi campi undefined che Firestore non accetta
    const cleanData = JSON.parse(JSON.stringify(data));
    
    // Firestore non supporta array annidati (array di array).
    // Convertiamo pcBoxes (Array[][]) in un oggetto mappa { "0": [], "1": [] }
    const pcBoxesMap = cleanData.pcBoxes.reduce((acc: any, box: any, index: number) => {
        acc[index.toString()] = box;
        return acc;
    }, {});

    const dataToSave = {
        party: cleanData.party,
        pcBoxes: pcBoxesMap,
        trainer: cleanData.trainer
    };

    console.log("Dati inviati a Firebase:", dataToSave);
    await setDoc(doc(db, "users", userId), dataToSave, { merge: true });
    console.log("Dati salvati con successo!");
  } catch (error) {
    console.error("Errore durante il salvataggio:", error);
    throw error; // Rilancia l'errore per permettere all'UI di mostrare l'alert
  }
};

/**
 * Carica i dati dell'utente da Firestore.
 * @param userId L'UID dell'utente loggato
 */
export const loadUserData = async (userId: string): Promise<UserData | null> => {
  if (!userId) return null;

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const firestoreData = docSnap.data();
      
      // Ricostruiamo l'array di array dalla mappa salvata
      let loadedPcBoxes: (PokemonCharacter | null)[][];

      if (firestoreData.pcBoxes && !Array.isArray(firestoreData.pcBoxes)) {
          // È una mappa (nuovo formato)
          loadedPcBoxes = Array.from({ length: 20 }, (_, i) => {
              return firestoreData.pcBoxes[i.toString()] || Array(30).fill(null);
          });
      } else {
          // Fallback se non troviamo i dati o sono in formato errato
          loadedPcBoxes = Array(20).fill(null).map(() => Array(30).fill(null));
      }

      return {
          party: firestoreData.party || Array(6).fill(null),
          pcBoxes: loadedPcBoxes,
          trainer: firestoreData.trainer || createInitialTrainer()
      };
    } else {
      console.log("Nessun dato trovato per questo utente (nuovo utente?).");
      return null;
    }
  } catch (error) {
    console.error("Errore durante il caricamento:", error);
    return null;
  }
};

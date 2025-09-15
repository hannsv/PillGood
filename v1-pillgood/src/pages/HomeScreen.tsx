import { useState } from "react";
// import { TodaysReminderCard } from "./TodaysReminderCard";
// import { MedicationCard } from "./MedicationCard";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  isEnabled: boolean;
}

interface HomeScreenProps {
  onNavigateToDetails: (medicationId: string) => void;
}

export function HomeScreen({ onNavigateToDetails }: HomeScreenProps) {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Vitamin D",
      dosage: "1000 IU",
      time: "2:00 PM",
      isEnabled: true,
    },
    {
      id: "2",
      name: "Omega-3",
      dosage: "500mg",
      time: "8:00 AM",
      isEnabled: true,
    },
    {
      id: "3",
      name: "Multivitamin",
      dosage: "1 tablet",
      time: "9:00 AM",
      isEnabled: false,
    },
    {
      id: "4",
      name: "Magnesium",
      dosage: "200mg",
      time: "10:00 PM",
      isEnabled: true,
    },
  ]);

  const toggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, isEnabled: !med.isEnabled } : med
      )
    );
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="py-6">
        <h1 className="text-gray-900 mb-6 px-4 font-semibold text-xl">
          Good morning! 👋
        </h1>

        <div className="mb-6">{/* <TodaysReminderCard /> */}</div>

        <div className="mb-4">
          <h2 className="text-gray-900 mb-4 px-4 font-semibold text-lg">
            Your Medications
          </h2>
          <div>
            {/* {medications.map((medication) => (
              <MedicationCard
                key={medication.id}
                name={medication.name}
                dosage={medication.dosage}
                time={medication.time}
                isEnabled={medication.isEnabled}
                onToggle={() => toggleMedication(medication.id)}
                onClick={() => onNavigateToDetails(medication.id)}
              />
            ))} */}
          </div>
        </div>
      </div>
    </div>
  );
}

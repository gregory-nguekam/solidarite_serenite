export type Association = {
  id: string;
  name: string;
  type: "ASSOCIATION" | "GROUPE" | "FAMILLE";
  city: string;
  membersCount: number;
  description: string;
};

export const associations: Association[] = [
  {
    id: "a1",
    name: "Fédération Nde de France",
    type: "ASSOCIATION",
    city: "Paris",
    membersCount: 128,
    description: "Structure communautaire - mutuelle de rapatriement.",
  },
  {
    id: "g1",
    name: "Groupe Haut-Nkam Île-de-France",
    type: "GROUPE",
    city: "Créteil",
    membersCount: 42,
    description: "Groupe local - accompagnement et solidarité.",
  },
  {
    id: "f1",
    name: "Association Menoua",
    type: "FAMILLE",
    city: "Lyon",
    membersCount: 9,
    description: "Cellule familiale rattachée à la mutuelle.",
  },
];

// Provincias y cantones de Costa Rica
export const provincias = [
  {
    id: 0,
    nombre: "San José",
    cantones: [
      "San José","Escazú","Desamparados","Puriscal","Tarrazú","Aserrí","Mora",
      "Goicoechea","Santa Ana","Alajuelita","Vázquez de Coronado","Acosta",
      "Tibás","Moravia","Montes de Oca","Curridabat","Turrubares","Dota",
      "León Cortés Castro","Pérez Zeledón"
    ]
  },
  {
    id: 1,
    nombre: "Alajuela",
    cantones: [
      "Alajuela","San Ramón","Grecia","San Mateo","Atenas","Naranjo",
      "Palmares","Poás","Orotina","San Carlos","Zarcero","Sarchí",
      "Upala","Los Chiles","Guatuso","Río Cuarto"
    ]
  },
  {
    id: 2,
    nombre: "Cartago",
    cantones: [
      "Cartago","Paraíso","La Unión","Jiménez","Turrialba","Alvarado",
      "Oreamuno","El Guarco"
    ]
  },
  {
    id: 3,
    nombre: "Heredia",
    cantones: [
      "Heredia","Barva","Santo Domingo","Santa Bárbara","San Rafael",
      "San Isidro","Belén","Flores","San Pablo","Sarapiquí"
    ]
  },
  {
    id: 4,
    nombre: "Guanacaste",
    cantones: [
      "Liberia","Nicoya","Santa Cruz","Bagaces","Carrillo","Cañas",
      "Abangares","Tilarán","Nandayure","La Cruz","Hojancha"
    ]
  },
  {
    id: 5,
    nombre: "Puntarenas",
    cantones: [
      "Puntarenas","Esparza","Buenos Aires","Montes de Oro","Osa","Quepos",
      "Golfito","Coto Brus","Parrita","Corredores","Garabito","Monteverde",
      "Puerto Jiménez"
    ]
  },
  {
    id: 6,
    nombre: "Limón",
    cantones: [
      "Limón","Pococí","Siquirres","Talamanca","Matina","Guácimo"
    ]
  }
];

// 🟩 Alimentación base por tipo de grupo
export const ALIMENTACION_POR_TIPO = {
  Bovino: {
    tipo: "Pastoreo (gramíneas/forraje) + suplemento mineral",
    cantidad: "8–12 kg MS/día (según peso y producción)",
    horario: "Mañana y tarde",
    suplemento: "Mezcla mineral ad libitum",
    observaciones: "Ajustar ración en lactancia / engorde",
  },
  Ovino: {
    tipo: "Pastoreo de pastos cortos y leguminosas + heno",
    cantidad: "2–4 kg MS/día",
    horario: "Dos tomas",
    suplemento: "Concentrado en crecimiento/lactancia",
    observaciones: "Evitar empaste; rotación de potreros",
  },
  Caprino: {
    tipo: "Ramoneo (arbustos/hojas) + pasto tierno y concentrado",
    cantidad: "2–3 kg MS/día",
    horario: "Mañana y tarde",
    suplemento: "Sales minerales específicas caprinas",
    observaciones: "Vigilancia de parásitos gastrointestinales",
  },
};

// 🐄🐑🐐 Ganado por tipo
export const GANADO = {
  Bovino: [
    {
      id: "B-001",
      nombre: "Jagger",
      raza: "Brahman",
      sexo: "Macho",
      fechaNacimiento: "2022-03-15",
      potreroActual: "Potrero La Esperanza",
      pesoKg: 350,
      tipoAlimentacion: "Pastoreo (gramíneas, forraje y suplementación mineral)",
      foto: "/images/Ganado_Bovino/vaca1.jpg",
    },
    {
      id: "B-002",
      nombre: "Estrella",
      raza: "Holstein",
      sexo: "Hembra",
      fechaNacimiento: "2021-11-03",
      potreroActual: "Potrero El Cedral",
      pesoKg: 420,
      tipoAlimentacion: "Forraje verde, heno, ensilaje y concentrado lácteo",
      foto: "/images/Ganado_Bovino/vaca2.jpg",
    },
    {
      id: "B-003",
      nombre: "Lucero",
      raza: "Jersey",
      sexo: "Macho",
      fechaNacimiento: "2023-01-20",
      potreroActual: "Potrero La Pradera",
      pesoKg: 280,
      tipoAlimentacion: "Pastoreo libre y suplementos energéticos",
      foto: "/images/Ganado_Bovino/vaca3.jpg",
    },
    {
      id: "B-004",
      nombre: "Canelo",
      raza: "Gyr",
      sexo: "Macho",
      fechaNacimiento: "2020-07-08",
      potreroActual: "Potrero Las Palmas",
      pesoKg: 480,
      tipoAlimentacion: "Pastoreo intensivo y suplemento proteico",
      foto: "/images/Ganado_Bovino/vaca4.jpg",
    },
  ],
  Ovino: [
    {
      id: "O-001",
      nombre: "Nube",
      raza: "Dorper",
      sexo: "Hembra",
      fechaNacimiento: "2023-04-04",
      potreroActual: "Potrero La Esperanza",
      pesoKg: 55,
      tipoAlimentacion: "Pastoreo de pastos cortos, leguminosas y heno",
      foto: "/images/Ganado_Ovino/oveja1.jpg",
    },
    {
      id: "O-002",
      nombre: "Copito",
      raza: "Katahdin",
      sexo: "Macho",
      fechaNacimiento: "2022-09-12",
      potreroActual: "Potrero El Cedral",
      pesoKg: 62,
      tipoAlimentacion: "Forraje natural con concentrado en crecimiento",
      foto: "/images/Ganado_Ovino/oveja2.jpg",
    },
    {
      id: "O-003",
      nombre: "Luna",
      raza: "Hampshire",
      sexo: "Hembra",
      fechaNacimiento: "2021-12-30",
      potreroActual: "Potrero La Pradera",
      pesoKg: 60,
      tipoAlimentacion: "Pastoreo mixto con granos y sales minerales",
      foto: "/images/Ganado_Ovino/oveja3.jpg",
    },
    {
      id: "O-004",
      nombre: "Brisa",
      raza: "Suffolk",
      sexo: "Hembra",
      fechaNacimiento: "2020-05-22",
      potreroActual: "Potrero Las Palmas",
      pesoKg: 68,
      tipoAlimentacion: "Pastoreo y suplemento proteico durante lactancia",
      foto: "/images/Ganado_Ovino/oveja4.jpg",
    },
  ],
  Caprino: [
    {
      id: "C-001",
      nombre: "Greta",
      raza: "Saanen",
      sexo: "Hembra",
      fechaNacimiento: "2022-02-10",
      potreroActual: "Potrero La Esperanza",
      pesoKg: 45,
      tipoAlimentacion: "Hojas de arbustos, pasto tierno y concentrado lechero",
      foto: "/images/Ganado_Caprino/cabra1.jpg",
    },
    {
      id: "C-002",
      nombre: "Roco",
      raza: "Boer",
      sexo: "Macho",
      fechaNacimiento: "2021-06-14",
      potreroActual: "Potrero El Cedral",
      pesoKg: 70,
      tipoAlimentacion: "Pastoreo de gramíneas y suplemento energético",
      foto: "/images/Ganado_Caprino/cabra2.jpg",
    },
    {
      id: "C-003",
      nombre: "Mora",
      raza: "Alpina",
      sexo: "Hembra",
      fechaNacimiento: "2023-03-05",
      potreroActual: "Potrero La Pradera",
      pesoKg: 43,
      tipoAlimentacion: "Forraje variado, hojas y concentrado diario",
      foto: "/images/Ganado_Caprino/cabra3.jpg",
    },
    {
      id: "C-004",
      nombre: "Trueno",
      raza: "Toggenburg",
      sexo: "Macho",
      fechaNacimiento: "2020-08-28",
      potreroActual: "Potrero Las Palmas",
      pesoKg: 75,
      tipoAlimentacion: "Pastoreo libre, ramas y mezcla proteica",
      foto: "/images/Ganado_Caprino/cabra4.jpg",
    },
  ],
};

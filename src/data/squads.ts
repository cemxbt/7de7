export type Pos = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
  n: string; // name
  p: Pos;
  r: number; // rating 50-99
}

export interface Squad {
  c: string; // country (EN)
  tr: string; // country (TR)
  f: string; // flag emoji
  y: number; // world cup year
  players: Player[];
}

export const SQUADS: Squad[] = [
  {
    c: 'Brazil', tr: 'Brezilya', f: '🇧🇷', y: 1970,
    players: [
      { n: 'Félix', p: 'GK', r: 78 }, { n: 'Ado', p: 'GK', r: 70 },
      { n: 'Carlos Alberto', p: 'DF', r: 92 }, { n: 'Brito', p: 'DF', r: 84 }, { n: 'Piazza', p: 'DF', r: 86 }, { n: 'Everaldo', p: 'DF', r: 82 }, { n: 'Marco Antônio', p: 'DF', r: 78 },
      { n: 'Gérson', p: 'MF', r: 91 }, { n: 'Clodoaldo', p: 'MF', r: 88 }, { n: 'Rivellino', p: 'MF', r: 93 }, { n: 'Paulo César', p: 'MF', r: 84 },
      { n: 'Pelé', p: 'FW', r: 99 }, { n: 'Jairzinho', p: 'FW', r: 94 }, { n: 'Tostão', p: 'FW', r: 92 }, { n: 'Roberto', p: 'FW', r: 76 },
    ],
  },
  {
    c: 'Brazil', tr: 'Brezilya', f: '🇧🇷', y: 1958,
    players: [
      { n: 'Gilmar', p: 'GK', r: 89 }, { n: 'Castilho', p: 'GK', r: 76 },
      { n: 'Djalma Santos', p: 'DF', r: 91 }, { n: 'Nílton Santos', p: 'DF', r: 93 }, { n: 'Bellini', p: 'DF', r: 84 }, { n: 'Orlando', p: 'DF', r: 83 }, { n: 'De Sordi', p: 'DF', r: 78 },
      { n: 'Didi', p: 'MF', r: 93 }, { n: 'Zito', p: 'MF', r: 86 }, { n: 'Zagallo', p: 'MF', r: 88 }, { n: 'Moacir', p: 'MF', r: 74 },
      { n: 'Pelé', p: 'FW', r: 96 }, { n: 'Garrincha', p: 'FW', r: 97 }, { n: 'Vavá', p: 'FW', r: 90 }, { n: 'Mazzola', p: 'FW', r: 82 },
    ],
  },
  {
    c: 'Brazil', tr: 'Brezilya', f: '🇧🇷', y: 1982,
    players: [
      { n: 'Waldir Peres', p: 'GK', r: 74 }, { n: 'Paulo Sérgio', p: 'GK', r: 70 },
      { n: 'Leandro', p: 'DF', r: 87 }, { n: 'Júnior', p: 'DF', r: 88 }, { n: 'Oscar', p: 'DF', r: 84 }, { n: 'Luizinho', p: 'DF', r: 81 }, { n: 'Edinho', p: 'DF', r: 79 },
      { n: 'Zico', p: 'MF', r: 96 }, { n: 'Sócrates', p: 'MF', r: 94 }, { n: 'Falcão', p: 'MF', r: 92 }, { n: 'Toninho Cerezo', p: 'MF', r: 89 }, { n: 'Dirceu', p: 'MF', r: 82 },
      { n: 'Éder', p: 'FW', r: 88 }, { n: 'Serginho', p: 'FW', r: 76 }, { n: 'Careca', p: 'FW', r: 84 },
    ],
  },
  {
    c: 'Brazil', tr: 'Brezilya', f: '🇧🇷', y: 1994,
    players: [
      { n: 'Taffarel', p: 'GK', r: 87 }, { n: 'Zetti', p: 'GK', r: 75 },
      { n: 'Cafu', p: 'DF', r: 88 }, { n: 'Jorginho', p: 'DF', r: 85 }, { n: 'Branco', p: 'DF', r: 85 }, { n: 'Aldair', p: 'DF', r: 87 }, { n: 'Márcio Santos', p: 'DF', r: 84 },
      { n: 'Dunga', p: 'MF', r: 88 }, { n: 'Mauro Silva', p: 'MF', r: 86 }, { n: 'Zinho', p: 'MF', r: 83 }, { n: 'Raí', p: 'MF', r: 84 }, { n: 'Mazinho', p: 'MF', r: 82 },
      { n: 'Romário', p: 'FW', r: 95 }, { n: 'Bebeto', p: 'FW', r: 91 }, { n: 'Müller', p: 'FW', r: 80 },
    ],
  },
  {
    c: 'Brazil', tr: 'Brezilya', f: '🇧🇷', y: 2002,
    players: [
      { n: 'Marcos', p: 'GK', r: 84 }, { n: 'Dida', p: 'GK', r: 82 },
      { n: 'Cafu', p: 'DF', r: 90 }, { n: 'Roberto Carlos', p: 'DF', r: 91 }, { n: 'Lúcio', p: 'DF', r: 87 }, { n: 'Edmílson', p: 'DF', r: 83 }, { n: 'Roque Júnior', p: 'DF', r: 80 },
      { n: 'Gilberto Silva', p: 'MF', r: 85 }, { n: 'Kléberson', p: 'MF', r: 81 }, { n: 'Ronaldinho', p: 'MF', r: 93 }, { n: 'Juninho Paulista', p: 'MF', r: 82 },
      { n: 'Ronaldo', p: 'FW', r: 97 }, { n: 'Rivaldo', p: 'FW', r: 94 }, { n: 'Denílson', p: 'FW', r: 83 }, { n: 'Edílson', p: 'FW', r: 79 },
    ],
  },
  {
    c: 'Argentina', tr: 'Arjantin', f: '🇦🇷', y: 1986,
    players: [
      { n: 'Pumpido', p: 'GK', r: 80 }, { n: 'Islas', p: 'GK', r: 74 },
      { n: 'Ruggeri', p: 'DF', r: 86 }, { n: 'Brown', p: 'DF', r: 82 }, { n: 'Cuciuffo', p: 'DF', r: 78 }, { n: 'Olarticoechea', p: 'DF', r: 80 }, { n: 'Clausen', p: 'DF', r: 75 },
      { n: 'Maradona', p: 'MF', r: 99 }, { n: 'Burruchaga', p: 'MF', r: 87 }, { n: 'Batista', p: 'MF', r: 83 }, { n: 'Giusti', p: 'MF', r: 81 }, { n: 'Enrique', p: 'MF', r: 80 },
      { n: 'Valdano', p: 'FW', r: 88 }, { n: 'Pasculli', p: 'FW', r: 79 }, { n: 'Borghi', p: 'FW', r: 77 },
    ],
  },
  {
    c: 'Argentina', tr: 'Arjantin', f: '🇦🇷', y: 1978,
    players: [
      { n: 'Fillol', p: 'GK', r: 89 }, { n: 'Baley', p: 'GK', r: 72 },
      { n: 'Passarella', p: 'DF', r: 91 }, { n: 'Tarantini', p: 'DF', r: 81 }, { n: 'Olguín', p: 'DF', r: 79 }, { n: 'Galván', p: 'DF', r: 80 }, { n: 'Villaverde', p: 'DF', r: 74 },
      { n: 'Ardiles', p: 'MF', r: 88 }, { n: 'Gallego', p: 'MF', r: 82 }, { n: 'Valencia', p: 'MF', r: 78 }, { n: 'Larrosa', p: 'MF', r: 76 },
      { n: 'Kempes', p: 'FW', r: 94 }, { n: 'Luque', p: 'FW', r: 86 }, { n: 'Bertoni', p: 'FW', r: 84 }, { n: 'Houseman', p: 'FW', r: 83 },
    ],
  },
  {
    c: 'Argentina', tr: 'Arjantin', f: '🇦🇷', y: 2022,
    players: [
      { n: 'E. Martínez', p: 'GK', r: 88 }, { n: 'Armani', p: 'GK', r: 78 },
      { n: 'Romero', p: 'DF', r: 85 }, { n: 'Otamendi', p: 'DF', r: 84 }, { n: 'Molina', p: 'DF', r: 82 }, { n: 'Tagliafico', p: 'DF', r: 82 }, { n: 'Lisandro Martínez', p: 'DF', r: 83 },
      { n: 'De Paul', p: 'MF', r: 86 }, { n: 'Enzo Fernández', p: 'MF', r: 87 }, { n: 'Mac Allister', p: 'MF', r: 86 }, { n: 'Paredes', p: 'MF', r: 82 },
      { n: 'Messi', p: 'FW', r: 98 }, { n: 'Di María', p: 'FW', r: 89 }, { n: 'J. Álvarez', p: 'FW', r: 86 }, { n: 'Lautaro Martínez', p: 'FW', r: 85 },
    ],
  },
  {
    c: 'West Germany', tr: 'Batı Almanya', f: '🇩🇪', y: 1974,
    players: [
      { n: 'Maier', p: 'GK', r: 92 }, { n: 'Kleff', p: 'GK', r: 75 },
      { n: 'Beckenbauer', p: 'DF', r: 97 }, { n: 'Vogts', p: 'DF', r: 87 }, { n: 'Breitner', p: 'DF', r: 91 }, { n: 'Schwarzenbeck', p: 'DF', r: 83 }, { n: 'Höttges', p: 'DF', r: 76 },
      { n: 'Overath', p: 'MF', r: 89 }, { n: 'Bonhof', p: 'MF', r: 87 }, { n: 'Hoeneß', p: 'MF', r: 86 }, { n: 'Wimmer', p: 'MF', r: 78 },
      { n: 'Gerd Müller', p: 'FW', r: 96 }, { n: 'Grabowski', p: 'FW', r: 85 }, { n: 'Hölzenbein', p: 'FW', r: 84 }, { n: 'Heynckes', p: 'FW', r: 83 },
    ],
  },
  {
    c: 'West Germany', tr: 'Batı Almanya', f: '🇩🇪', y: 1990,
    players: [
      { n: 'Illgner', p: 'GK', r: 84 }, { n: 'Aumann', p: 'GK', r: 76 },
      { n: 'Brehme', p: 'DF', r: 90 }, { n: 'Kohler', p: 'DF', r: 87 }, { n: 'Augenthaler', p: 'DF', r: 84 }, { n: 'Buchwald', p: 'DF', r: 85 }, { n: 'Berthold', p: 'DF', r: 82 },
      { n: 'Matthäus', p: 'MF', r: 95 }, { n: 'Häßler', p: 'MF', r: 86 }, { n: 'Littbarski', p: 'MF', r: 85 }, { n: 'Bein', p: 'MF', r: 77 },
      { n: 'Klinsmann', p: 'FW', r: 90 }, { n: 'Völler', p: 'FW', r: 89 }, { n: 'Riedle', p: 'FW', r: 83 },
    ],
  },
  {
    c: 'Germany', tr: 'Almanya', f: '🇩🇪', y: 2014,
    players: [
      { n: 'Neuer', p: 'GK', r: 94 }, { n: 'Weidenfeller', p: 'GK', r: 78 },
      { n: 'Lahm', p: 'DF', r: 92 }, { n: 'Hummels', p: 'DF', r: 89 }, { n: 'Boateng', p: 'DF', r: 87 }, { n: 'Höwedes', p: 'DF', r: 81 }, { n: 'Mertesacker', p: 'DF', r: 82 },
      { n: 'Kroos', p: 'MF', r: 92 }, { n: 'Schweinsteiger', p: 'MF', r: 89 }, { n: 'Özil', p: 'MF', r: 88 }, { n: 'Khedira', p: 'MF', r: 85 }, { n: 'Götze', p: 'MF', r: 85 },
      { n: 'Müller', p: 'FW', r: 90 }, { n: 'Klose', p: 'FW', r: 87 }, { n: 'Podolski', p: 'FW', r: 83 }, { n: 'Schürrle', p: 'FW', r: 82 },
    ],
  },
  {
    c: 'Italy', tr: 'İtalya', f: '🇮🇹', y: 1982,
    players: [
      { n: 'Zoff', p: 'GK', r: 93 }, { n: 'Bordon', p: 'GK', r: 78 },
      { n: 'Scirea', p: 'DF', r: 92 }, { n: 'Gentile', p: 'DF', r: 88 }, { n: 'Cabrini', p: 'DF', r: 87 }, { n: 'Collovati', p: 'DF', r: 83 }, { n: 'Bergomi', p: 'DF', r: 82 },
      { n: 'Tardelli', p: 'MF', r: 89 }, { n: 'Antognoni', p: 'MF', r: 86 }, { n: 'Oriali', p: 'MF', r: 82 }, { n: 'Marini', p: 'MF', r: 78 },
      { n: 'Paolo Rossi', p: 'FW', r: 93 }, { n: 'Bruno Conti', p: 'FW', r: 88 }, { n: 'Graziani', p: 'FW', r: 83 }, { n: 'Altobelli', p: 'FW', r: 84 },
    ],
  },
  {
    c: 'Italy', tr: 'İtalya', f: '🇮🇹', y: 2006,
    players: [
      { n: 'Buffon', p: 'GK', r: 94 }, { n: 'Peruzzi', p: 'GK', r: 79 },
      { n: 'Cannavaro', p: 'DF', r: 94 }, { n: 'Nesta', p: 'DF', r: 90 }, { n: 'Zambrotta', p: 'DF', r: 87 }, { n: 'Materazzi', p: 'DF', r: 84 }, { n: 'Grosso', p: 'DF', r: 83 },
      { n: 'Pirlo', p: 'MF', r: 92 }, { n: 'Gattuso', p: 'MF', r: 86 }, { n: 'De Rossi', p: 'MF', r: 84 }, { n: 'Camoranesi', p: 'MF', r: 83 }, { n: 'Perrotta', p: 'MF', r: 81 },
      { n: 'Totti', p: 'FW', r: 91 }, { n: 'Del Piero', p: 'FW', r: 89 }, { n: 'Toni', p: 'FW', r: 85 }, { n: 'Inzaghi', p: 'FW', r: 84 },
    ],
  },
  {
    c: 'Italy', tr: 'İtalya', f: '🇮🇹', y: 1990,
    players: [
      { n: 'Zenga', p: 'GK', r: 87 }, { n: 'Tacconi', p: 'GK', r: 78 },
      { n: 'Maldini', p: 'DF', r: 89 }, { n: 'Baresi', p: 'DF', r: 93 }, { n: 'Bergomi', p: 'DF', r: 85 }, { n: 'Ferri', p: 'DF', r: 82 }, { n: 'De Agostini', p: 'DF', r: 79 },
      { n: 'Giannini', p: 'MF', r: 84 }, { n: 'De Napoli', p: 'MF', r: 80 }, { n: 'Donadoni', p: 'MF', r: 84 }, { n: 'Ancelotti', p: 'MF', r: 83 },
      { n: 'Roberto Baggio', p: 'FW', r: 91 }, { n: 'Schillaci', p: 'FW', r: 87 }, { n: 'Vialli', p: 'FW', r: 85 }, { n: 'Serena', p: 'FW', r: 79 },
    ],
  },
  {
    c: 'France', tr: 'Fransa', f: '🇫🇷', y: 1998,
    players: [
      { n: 'Barthez', p: 'GK', r: 87 }, { n: 'Lama', p: 'GK', r: 79 },
      { n: 'Thuram', p: 'DF', r: 90 }, { n: 'Desailly', p: 'DF', r: 90 }, { n: 'Blanc', p: 'DF', r: 88 }, { n: 'Lizarazu', p: 'DF', r: 86 }, { n: 'Leboeuf', p: 'DF', r: 80 },
      { n: 'Zidane', p: 'MF', r: 96 }, { n: 'Deschamps', p: 'MF', r: 88 }, { n: 'Petit', p: 'MF', r: 85 }, { n: 'Djorkaeff', p: 'MF', r: 86 }, { n: 'Vieira', p: 'MF', r: 84 },
      { n: 'Henry', p: 'FW', r: 85 }, { n: 'Trezeguet', p: 'FW', r: 83 }, { n: 'Guivarc’h', p: 'FW', r: 75 }, { n: 'Dugarry', p: 'FW', r: 78 },
    ],
  },
  {
    c: 'France', tr: 'Fransa', f: '🇫🇷', y: 2018,
    players: [
      { n: 'Lloris', p: 'GK', r: 87 }, { n: 'Areola', p: 'GK', r: 78 },
      { n: 'Varane', p: 'DF', r: 88 }, { n: 'Umtiti', p: 'DF', r: 85 }, { n: 'Pavard', p: 'DF', r: 81 }, { n: 'L. Hernández', p: 'DF', r: 84 }, { n: 'Kimpembe', p: 'DF', r: 79 },
      { n: 'Kanté', p: 'MF', r: 91 }, { n: 'Pogba', p: 'MF', r: 88 }, { n: 'Matuidi', p: 'MF', r: 83 }, { n: 'Tolisso', p: 'MF', r: 79 },
      { n: 'Mbappé', p: 'FW', r: 91 }, { n: 'Griezmann', p: 'FW', r: 90 }, { n: 'Giroud', p: 'FW', r: 83 }, { n: 'Dembélé', p: 'FW', r: 82 },
    ],
  },
  {
    c: 'France', tr: 'Fransa', f: '🇫🇷', y: 2006,
    players: [
      { n: 'Barthez', p: 'GK', r: 83 }, { n: 'Coupet', p: 'GK', r: 81 },
      { n: 'Thuram', p: 'DF', r: 87 }, { n: 'Gallas', p: 'DF', r: 84 }, { n: 'Sagnol', p: 'DF', r: 82 }, { n: 'Abidal', p: 'DF', r: 83 }, { n: 'Boumsong', p: 'DF', r: 76 },
      { n: 'Zidane', p: 'MF', r: 93 }, { n: 'Vieira', p: 'MF', r: 88 }, { n: 'Makélélé', p: 'MF', r: 88 }, { n: 'Ribéry', p: 'MF', r: 84 }, { n: 'Malouda', p: 'MF', r: 81 },
      { n: 'Henry', p: 'FW', r: 90 }, { n: 'Trezeguet', p: 'FW', r: 83 }, { n: 'Saha', p: 'FW', r: 78 },
    ],
  },
  {
    c: 'Spain', tr: 'İspanya', f: '🇪🇸', y: 2010,
    players: [
      { n: 'Casillas', p: 'GK', r: 92 }, { n: 'Valdés', p: 'GK', r: 84 },
      { n: 'Puyol', p: 'DF', r: 89 }, { n: 'Piqué', p: 'DF', r: 88 }, { n: 'Sergio Ramos', p: 'DF', r: 88 }, { n: 'Capdevila', p: 'DF', r: 81 }, { n: 'Arbeloa', p: 'DF', r: 79 },
      { n: 'Xavi', p: 'MF', r: 95 }, { n: 'Iniesta', p: 'MF', r: 94 }, { n: 'Busquets', p: 'MF', r: 88 }, { n: 'Xabi Alonso', p: 'MF', r: 88 }, { n: 'Fàbregas', p: 'MF', r: 87 }, { n: 'David Silva', p: 'MF', r: 87 },
      { n: 'Villa', p: 'FW', r: 90 }, { n: 'Torres', p: 'FW', r: 84 }, { n: 'Pedro', p: 'FW', r: 84 },
    ],
  },
  {
    c: 'Netherlands', tr: 'Hollanda', f: '🇳🇱', y: 1974,
    players: [
      { n: 'Jongbloed', p: 'GK', r: 76 }, { n: 'Schrijvers', p: 'GK', r: 74 },
      { n: 'Krol', p: 'DF', r: 89 }, { n: 'Suurbier', p: 'DF', r: 84 }, { n: 'Rijsbergen', p: 'DF', r: 81 }, { n: 'Haan', p: 'DF', r: 84 }, { n: 'Israël', p: 'DF', r: 78 },
      { n: 'Neeskens', p: 'MF', r: 92 }, { n: 'Van Hanegem', p: 'MF', r: 88 }, { n: 'Jansen', p: 'MF', r: 82 }, { n: 'De Jong', p: 'MF', r: 76 },
      { n: 'Cruyff', p: 'FW', r: 98 }, { n: 'Rensenbrink', p: 'FW', r: 88 }, { n: 'Rep', p: 'FW', r: 86 }, { n: 'Keizer', p: 'FW', r: 83 },
    ],
  },
  {
    c: 'Netherlands', tr: 'Hollanda', f: '🇳🇱', y: 2010,
    players: [
      { n: 'Stekelenburg', p: 'GK', r: 80 }, { n: 'Vorm', p: 'GK', r: 75 },
      { n: 'Van der Wiel', p: 'DF', r: 79 }, { n: 'Heitinga', p: 'DF', r: 80 }, { n: 'Mathijsen', p: 'DF', r: 79 }, { n: 'Van Bronckhorst', p: 'DF', r: 82 }, { n: 'Ooijer', p: 'DF', r: 74 },
      { n: 'Sneijder', p: 'MF', r: 90 }, { n: 'Van Bommel', p: 'MF', r: 84 }, { n: 'De Jong', p: 'MF', r: 81 }, { n: 'Van der Vaart', p: 'MF', r: 83 },
      { n: 'Robben', p: 'FW', r: 91 }, { n: 'Van Persie', p: 'FW', r: 87 }, { n: 'Kuyt', p: 'FW', r: 83 }, { n: 'Huntelaar', p: 'FW', r: 81 },
    ],
  },
  {
    c: 'England', tr: 'İngiltere', f: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', y: 1966,
    players: [
      { n: 'Banks', p: 'GK', r: 92 }, { n: 'Bonetti', p: 'GK', r: 80 },
      { n: 'Bobby Moore', p: 'DF', r: 93 }, { n: 'Jack Charlton', p: 'DF', r: 84 }, { n: 'Cohen', p: 'DF', r: 81 }, { n: 'Wilson', p: 'DF', r: 81 },
      { n: 'Bobby Charlton', p: 'MF', r: 95 }, { n: 'Ball', p: 'MF', r: 86 }, { n: 'Peters', p: 'MF', r: 85 }, { n: 'Stiles', p: 'MF', r: 82 },
      { n: 'Hurst', p: 'FW', r: 88 }, { n: 'Greaves', p: 'FW', r: 87 }, { n: 'Hunt', p: 'FW', r: 82 }, { n: 'Callaghan', p: 'FW', r: 78 },
    ],
  },
  {
    c: 'England', tr: 'İngiltere', f: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', y: 1990,
    players: [
      { n: 'Shilton', p: 'GK', r: 88 }, { n: 'Woods', p: 'GK', r: 78 },
      { n: 'Pearce', p: 'DF', r: 84 }, { n: 'Walker', p: 'DF', r: 83 }, { n: 'Butcher', p: 'DF', r: 82 }, { n: 'Parker', p: 'DF', r: 79 }, { n: 'Wright', p: 'DF', r: 78 },
      { n: 'Gascoigne', p: 'MF', r: 89 }, { n: 'Platt', p: 'MF', r: 84 }, { n: 'Waddle', p: 'MF', r: 84 }, { n: 'Robson', p: 'MF', r: 85 },
      { n: 'Lineker', p: 'FW', r: 90 }, { n: 'Beardsley', p: 'FW', r: 83 }, { n: 'Barnes', p: 'FW', r: 84 },
    ],
  },
  {
    c: 'Portugal', tr: 'Portekiz', f: '🇵🇹', y: 1966,
    players: [
      { n: 'José Pereira', p: 'GK', r: 78 }, { n: 'Carvalho', p: 'GK', r: 72 },
      { n: 'Hilário', p: 'DF', r: 78 }, { n: 'Vicente', p: 'DF', r: 77 }, { n: 'Germano', p: 'DF', r: 80 }, { n: 'Morais', p: 'DF', r: 75 }, { n: 'Festa', p: 'DF', r: 73 },
      { n: 'Coluna', p: 'MF', r: 88 }, { n: 'Jaime Graça', p: 'MF', r: 79 }, { n: 'José Augusto', p: 'MF', r: 83 },
      { n: 'Eusébio', p: 'FW', r: 95 }, { n: 'Torres', p: 'FW', r: 84 }, { n: 'Simões', p: 'FW', r: 83 }, { n: 'Yaúca', p: 'FW', r: 72 },
    ],
  },
  {
    c: 'Portugal', tr: 'Portekiz', f: '🇵🇹', y: 2006,
    players: [
      { n: 'Ricardo', p: 'GK', r: 82 }, { n: 'Quim', p: 'GK', r: 76 },
      { n: 'Ricardo Carvalho', p: 'DF', r: 87 }, { n: 'Miguel', p: 'DF', r: 80 }, { n: 'Nuno Valente', p: 'DF', r: 78 }, { n: 'Fernando Meira', p: 'DF', r: 78 }, { n: 'Paulo Ferreira', p: 'DF', r: 79 },
      { n: 'Deco', p: 'MF', r: 88 }, { n: 'Maniche', p: 'MF', r: 84 }, { n: 'Costinha', p: 'MF', r: 79 }, { n: 'Tiago', p: 'MF', r: 78 },
      { n: 'Figo', p: 'FW', r: 89 }, { n: 'Cristiano Ronaldo', p: 'FW', r: 86 }, { n: 'Pauleta', p: 'FW', r: 82 }, { n: 'Simão', p: 'FW', r: 83 },
    ],
  },
  {
    c: 'Hungary', tr: 'Macaristan', f: '🇭🇺', y: 1954,
    players: [
      { n: 'Grosics', p: 'GK', r: 86 }, { n: 'Gellér', p: 'GK', r: 72 },
      { n: 'Buzánszky', p: 'DF', r: 79 }, { n: 'Lóránt', p: 'DF', r: 81 }, { n: 'Lantos', p: 'DF', r: 78 },
      { n: 'Bozsik', p: 'MF', r: 90 }, { n: 'Zakariás', p: 'MF', r: 79 }, { n: 'Hidegkuti', p: 'MF', r: 92 },
      { n: 'Puskás', p: 'FW', r: 97 }, { n: 'Kocsis', p: 'FW', r: 94 }, { n: 'Czibor', p: 'FW', r: 89 }, { n: 'Budai', p: 'FW', r: 82 }, { n: 'Tóth', p: 'FW', r: 76 },
    ],
  },
  {
    c: 'Uruguay', tr: 'Uruguay', f: '🇺🇾', y: 1950,
    players: [
      { n: 'Máspoli', p: 'GK', r: 84 }, { n: 'Paz', p: 'GK', r: 70 },
      { n: 'Varela', p: 'DF', r: 91 }, { n: 'Tejera', p: 'DF', r: 78 }, { n: 'González', p: 'DF', r: 77 }, { n: 'Gambetta', p: 'DF', r: 79 },
      { n: 'Andrade', p: 'MF', r: 85 }, { n: 'Pérez', p: 'MF', r: 81 }, { n: 'Morán', p: 'MF', r: 76 },
      { n: 'Schiaffino', p: 'FW', r: 92 }, { n: 'Ghiggia', p: 'FW', r: 88 }, { n: 'Míguez', p: 'FW', r: 86 }, { n: 'Vidal', p: 'FW', r: 75 },
    ],
  },
  {
    c: 'Uruguay', tr: 'Uruguay', f: '🇺🇾', y: 2010,
    players: [
      { n: 'Muslera', p: 'GK', r: 81 }, { n: 'Castillo', p: 'GK', r: 72 },
      { n: 'Lugano', p: 'DF', r: 81 }, { n: 'Godín', p: 'DF', r: 83 }, { n: 'M. Pereira', p: 'DF', r: 78 }, { n: 'Fucile', p: 'DF', r: 76 }, { n: 'Victorino', p: 'DF', r: 74 },
      { n: 'Arévalo Ríos', p: 'MF', r: 77 }, { n: 'Pérez', p: 'MF', r: 76 }, { n: 'A. Fernández', p: 'MF', r: 75 }, { n: 'Gargano', p: 'MF', r: 76 },
      { n: 'Forlán', p: 'FW', r: 89 }, { n: 'Suárez', p: 'FW', r: 86 }, { n: 'Cavani', p: 'FW', r: 84 }, { n: 'Abreu', p: 'FW', r: 77 },
    ],
  },
  {
    c: 'Croatia', tr: 'Hırvatistan', f: '🇭🇷', y: 2018,
    players: [
      { n: 'Subašić', p: 'GK', r: 82 }, { n: 'Kalinić', p: 'GK', r: 74 },
      { n: 'Lovren', p: 'DF', r: 81 }, { n: 'Vida', p: 'DF', r: 80 }, { n: 'Vrsaljko', p: 'DF', r: 80 }, { n: 'Strinić', p: 'DF', r: 77 }, { n: 'Ćorluka', p: 'DF', r: 76 },
      { n: 'Modrić', p: 'MF', r: 93 }, { n: 'Rakitić', p: 'MF', r: 87 }, { n: 'Brozović', p: 'MF', r: 83 }, { n: 'Kovačić', p: 'MF', r: 83 },
      { n: 'Mandžukić', p: 'FW', r: 85 }, { n: 'Perišić', p: 'FW', r: 85 }, { n: 'Rebić', p: 'FW', r: 80 }, { n: 'Kramarić', p: 'FW', r: 81 },
    ],
  },
  {
    c: 'Croatia', tr: 'Hırvatistan', f: '🇭🇷', y: 1998,
    players: [
      { n: 'Ladić', p: 'GK', r: 79 }, { n: 'Mrmić', p: 'GK', r: 71 },
      { n: 'Bilić', p: 'DF', r: 82 }, { n: 'Štimac', p: 'DF', r: 80 }, { n: 'Šimić', p: 'DF', r: 81 }, { n: 'Jarni', p: 'DF', r: 82 }, { n: 'Soldo', p: 'DF', r: 76 },
      { n: 'Boban', p: 'MF', r: 88 }, { n: 'Prosinečki', p: 'MF', r: 87 }, { n: 'Asanović', p: 'MF', r: 83 }, { n: 'Stanić', p: 'MF', r: 79 },
      { n: 'Šuker', p: 'FW', r: 91 }, { n: 'Vlaović', p: 'FW', r: 78 }, { n: 'Bokšić', p: 'FW', r: 82 },
    ],
  },
  {
    c: 'Belgium', tr: 'Belçika', f: '🇧🇪', y: 2018,
    players: [
      { n: 'Courtois', p: 'GK', r: 90 }, { n: 'Mignolet', p: 'GK', r: 78 },
      { n: 'Kompany', p: 'DF', r: 85 }, { n: 'Alderweireld', p: 'DF', r: 84 }, { n: 'Vertonghen', p: 'DF', r: 84 }, { n: 'Meunier', p: 'DF', r: 81 }, { n: 'Boyata', p: 'DF', r: 75 },
      { n: 'De Bruyne', p: 'MF', r: 92 }, { n: 'Witsel', p: 'MF', r: 83 }, { n: 'Fellaini', p: 'MF', r: 79 }, { n: 'Tielemans', p: 'MF', r: 79 }, { n: 'Carrasco', p: 'MF', r: 80 },
      { n: 'Hazard', p: 'FW', r: 91 }, { n: 'Lukaku', p: 'FW', r: 87 }, { n: 'Mertens', p: 'FW', r: 84 },
    ],
  },
  {
    c: 'Denmark', tr: 'Danimarka', f: '🇩🇰', y: 1986,
    players: [
      { n: 'Rasmussen', p: 'GK', r: 76 }, { n: 'Høgh', p: 'GK', r: 72 },
      { n: 'Morten Olsen', p: 'DF', r: 85 }, { n: 'Sivebæk', p: 'DF', r: 79 }, { n: 'Busk', p: 'DF', r: 76 }, { n: 'Nielsen', p: 'DF', r: 75 }, { n: 'Andersen', p: 'DF', r: 74 },
      { n: 'Lerby', p: 'MF', r: 84 }, { n: 'Arnesen', p: 'MF', r: 84 }, { n: 'Jesper Olsen', p: 'MF', r: 81 }, { n: 'Mølby', p: 'MF', r: 82 }, { n: 'Bertelsen', p: 'MF', r: 76 },
      { n: 'Michael Laudrup', p: 'FW', r: 91 }, { n: 'Elkjær', p: 'FW', r: 90 }, { n: 'Berggreen', p: 'FW', r: 80 },
    ],
  },
  {
    c: 'Sweden', tr: 'İsveç', f: '🇸🇪', y: 1994,
    players: [
      { n: 'Ravelli', p: 'GK', r: 86 }, { n: 'Eriksson', p: 'GK', r: 72 },
      { n: 'R. Nilsson', p: 'DF', r: 79 }, { n: 'P. Andersson', p: 'DF', r: 78 }, { n: 'Björklund', p: 'DF', r: 79 }, { n: 'Ljung', p: 'DF', r: 76 }, { n: 'Kåmark', p: 'DF', r: 74 },
      { n: 'Brolin', p: 'MF', r: 87 }, { n: 'Thern', p: 'MF', r: 82 }, { n: 'Schwarz', p: 'MF', r: 82 }, { n: 'Ingesson', p: 'MF', r: 80 }, { n: 'Mild', p: 'MF', r: 78 },
      { n: 'K. Andersson', p: 'FW', r: 85 }, { n: 'Dahlin', p: 'FW', r: 85 }, { n: 'H. Larsson', p: 'FW', r: 81 },
    ],
  },
  {
    c: 'Bulgaria', tr: 'Bulgaristan', f: '🇧🇬', y: 1994,
    players: [
      { n: 'Mihaylov', p: 'GK', r: 81 }, { n: 'Nikolov', p: 'GK', r: 70 },
      { n: 'Ivanov', p: 'DF', r: 79 }, { n: 'Houbchev', p: 'DF', r: 77 }, { n: 'Tzvetanov', p: 'DF', r: 75 }, { n: 'Kiriakov', p: 'DF', r: 74 }, { n: 'Kremenliev', p: 'DF', r: 73 },
      { n: 'Balakov', p: 'MF', r: 86 }, { n: 'Letchkov', p: 'MF', r: 84 }, { n: 'Yankov', p: 'MF', r: 76 }, { n: 'Sirakov', p: 'MF', r: 81 },
      { n: 'Stoichkov', p: 'FW', r: 93 }, { n: 'Kostadinov', p: 'FW', r: 82 }, { n: 'Borimirov', p: 'FW', r: 74 },
    ],
  },
  {
    c: 'Romania', tr: 'Romanya', f: '🇷🇴', y: 1994,
    players: [
      { n: 'Stelea', p: 'GK', r: 78 }, { n: 'Prunea', p: 'GK', r: 74 },
      { n: 'Petrescu', p: 'DF', r: 84 }, { n: 'Belodedici', p: 'DF', r: 85 }, { n: 'Prodan', p: 'DF', r: 80 }, { n: 'Mihali', p: 'DF', r: 76 }, { n: 'Selymes', p: 'DF', r: 76 },
      { n: 'Hagi', p: 'MF', r: 93 }, { n: 'Popescu', p: 'MF', r: 86 }, { n: 'D. Munteanu', p: 'MF', r: 82 }, { n: 'Lupescu', p: 'MF', r: 79 },
      { n: 'Dumitrescu', p: 'FW', r: 85 }, { n: 'Răducioiu', p: 'FW', r: 84 }, { n: 'Vlădoiu', p: 'FW', r: 73 },
    ],
  },
  {
    c: 'Poland', tr: 'Polonya', f: '🇵🇱', y: 1974,
    players: [
      { n: 'Tomaszewski', p: 'GK', r: 87 }, { n: 'Kalinowski', p: 'GK', r: 72 },
      { n: 'Żmuda', p: 'DF', r: 84 }, { n: 'Gorgoń', p: 'DF', r: 82 }, { n: 'Szymanowski', p: 'DF', r: 80 }, { n: 'Musiał', p: 'DF', r: 77 }, { n: 'Bulzacki', p: 'DF', r: 73 },
      { n: 'Deyna', p: 'MF', r: 90 }, { n: 'Kasperczak', p: 'MF', r: 80 }, { n: 'Maszczyk', p: 'MF', r: 78 }, { n: 'Ćmikiewicz', p: 'MF', r: 75 },
      { n: 'Lato', p: 'FW', r: 91 }, { n: 'Szarmach', p: 'FW', r: 87 }, { n: 'Gadocha', p: 'FW', r: 86 },
    ],
  },
  {
    c: 'Soviet Union', tr: 'Sovyetler Birliği', f: '🇷🇺', y: 1986,
    players: [
      { n: 'Dasaev', p: 'GK', r: 88 }, { n: 'Chanov', p: 'GK', r: 74 },
      { n: 'Demianenko', p: 'DF', r: 82 }, { n: 'Kuznetsov', p: 'DF', r: 81 }, { n: 'Bessonov', p: 'DF', r: 79 }, { n: 'Bal', p: 'DF', r: 75 }, { n: 'Larionov', p: 'DF', r: 74 },
      { n: 'Zavarov', p: 'MF', r: 85 }, { n: 'Rats', p: 'MF', r: 80 }, { n: 'Aleinikov', p: 'MF', r: 81 }, { n: 'Yakovenko', p: 'MF', r: 78 },
      { n: 'Belanov', p: 'FW', r: 87 }, { n: 'Blokhin', p: 'FW', r: 84 }, { n: 'Protasov', p: 'FW', r: 82 }, { n: 'Rodionov', p: 'FW', r: 77 },
    ],
  },
  {
    c: 'Mexico', tr: 'Meksika', f: '🇲🇽', y: 1986,
    players: [
      { n: 'Larios', p: 'GK', r: 78 }, { n: 'Zelada', p: 'GK', r: 70 },
      { n: 'Quirarte', p: 'DF', r: 78 }, { n: 'F. Cruz', p: 'DF', r: 74 }, { n: 'Amador', p: 'DF', r: 73 }, { n: 'Félix Cruz', p: 'DF', r: 72 }, { n: 'Servín', p: 'DF', r: 75 },
      { n: 'Negrete', p: 'MF', r: 84 }, { n: 'Boy', p: 'MF', r: 80 }, { n: 'Aguirre', p: 'MF', r: 79 }, { n: 'Muñoz', p: 'MF', r: 75 }, { n: 'España', p: 'MF', r: 77 },
      { n: 'Hugo Sánchez', p: 'FW', r: 90 }, { n: 'L. Flores', p: 'FW', r: 77 }, { n: 'Sánchez Galindo', p: 'FW', r: 72 },
    ],
  },
  {
    c: 'Cameroon', tr: 'Kamerun', f: '🇨🇲', y: 1990,
    players: [
      { n: "N'Kono", p: 'GK', r: 84 }, { n: 'Bell', p: 'GK', r: 78 },
      { n: 'Tataw', p: 'DF', r: 76 }, { n: 'Massing', p: 'DF', r: 74 }, { n: 'Kunde', p: 'DF', r: 76 }, { n: 'Ebwelle', p: 'DF', r: 73 }, { n: 'Onana', p: 'DF', r: 72 },
      { n: 'Mbouh', p: 'MF', r: 77 }, { n: 'Maboang', p: 'MF', r: 73 }, { n: 'Pagal', p: 'MF', r: 75 }, { n: 'Mfede', p: 'MF', r: 72 },
      { n: 'Roger Milla', p: 'FW', r: 88 }, { n: 'Omam-Biyik', p: 'FW', r: 83 }, { n: 'Makanaky', p: 'FW', r: 78 },
    ],
  },
  {
    c: 'Nigeria', tr: 'Nijerya', f: '🇳🇬', y: 1994,
    players: [
      { n: 'Rufai', p: 'GK', r: 80 }, { n: 'Agu', p: 'GK', r: 70 },
      { n: 'Keshi', p: 'DF', r: 78 }, { n: 'Eguavoen', p: 'DF', r: 76 }, { n: 'Iroha', p: 'DF', r: 74 }, { n: 'Okechukwu', p: 'DF', r: 75 }, { n: 'Emenalo', p: 'DF', r: 73 },
      { n: 'Okocha', p: 'MF', r: 86 }, { n: 'Oliseh', p: 'MF', r: 82 }, { n: 'Siasia', p: 'MF', r: 77 }, { n: 'Adepoju', p: 'MF', r: 76 },
      { n: 'Yekini', p: 'FW', r: 85 }, { n: 'Amokachi', p: 'FW', r: 83 }, { n: 'Finidi', p: 'FW', r: 83 }, { n: 'Amunike', p: 'FW', r: 82 },
    ],
  },
  {
    c: 'Türkiye', tr: 'Türkiye', f: '🇹🇷', y: 2002,
    players: [
      { n: 'Rüştü', p: 'GK', r: 88 }, { n: 'Ömer Çatkıç', p: 'GK', r: 74 },
      { n: 'Alpay', p: 'DF', r: 82 }, { n: 'Bülent Korkmaz', p: 'DF', r: 81 }, { n: 'Fatih Akyel', p: 'DF', r: 77 }, { n: 'Hakan Ünsal', p: 'DF', r: 78 }, { n: 'Ergün Penbe', p: 'DF', r: 76 },
      { n: 'Tugay', p: 'MF', r: 82 }, { n: 'Emre Belözoğlu', p: 'MF', r: 83 }, { n: 'Yıldıray Baştürk', p: 'MF', r: 85 }, { n: 'Okan Buruk', p: 'MF', r: 80 }, { n: 'Ümit Davala', p: 'MF', r: 80 },
      { n: 'Hakan Şükür', p: 'FW', r: 86 }, { n: 'Hasan Şaş', p: 'FW', r: 84 }, { n: 'Nihat Kahveci', p: 'FW', r: 82 }, { n: 'İlhan Mansız', p: 'FW', r: 81 },
    ],
  },
  {
    c: 'South Korea', tr: 'Güney Kore', f: '🇰🇷', y: 2002,
    players: [
      { n: 'Lee Woon-jae', p: 'GK', r: 80 }, { n: 'Kim Byung-ji', p: 'GK', r: 73 },
      { n: 'Hong Myung-bo', p: 'DF', r: 84 }, { n: 'Choi Jin-cheul', p: 'DF', r: 76 }, { n: 'Kim Tae-young', p: 'DF', r: 75 }, { n: 'Lee Young-pyo', p: 'DF', r: 80 }, { n: 'Song Chong-gug', p: 'DF', r: 78 },
      { n: 'Park Ji-sung', p: 'MF', r: 83 }, { n: 'Yoo Sang-chul', p: 'MF', r: 79 }, { n: 'Kim Nam-il', p: 'MF', r: 78 }, { n: 'Lee Eul-yong', p: 'MF', r: 76 },
      { n: 'Ahn Jung-hwan', p: 'FW', r: 81 }, { n: 'Seol Ki-hyeon', p: 'FW', r: 79 }, { n: 'Hwang Sun-hong', p: 'FW', r: 78 },
    ],
  },
  {
    c: 'Japan', tr: 'Japonya', f: '🇯🇵', y: 2002,
    players: [
      { n: 'Narazaki', p: 'GK', r: 79 }, { n: 'Kawaguchi', p: 'GK', r: 76 },
      { n: 'Miyamoto', p: 'DF', r: 77 }, { n: 'Matsuda', p: 'DF', r: 76 }, { n: 'Nakata Koji', p: 'DF', r: 75 }, { n: 'Akita', p: 'DF', r: 74 }, { n: 'Hattori', p: 'DF', r: 72 },
      { n: 'Hidetoshi Nakata', p: 'MF', r: 85 }, { n: 'Ono', p: 'MF', r: 82 }, { n: 'Inamoto', p: 'MF', r: 80 }, { n: 'Toda', p: 'MF', r: 76 }, { n: 'Myojin', p: 'MF', r: 74 },
      { n: 'Yanagisawa', p: 'FW', r: 76 }, { n: 'Suzuki', p: 'FW', r: 75 }, { n: 'Morishima', p: 'FW', r: 76 },
    ],
  },
  {
    c: 'United States', tr: 'ABD', f: '🇺🇸', y: 1994,
    players: [
      { n: 'Meola', p: 'GK', r: 77 }, { n: 'Friedel', p: 'GK', r: 74 },
      { n: 'Lalas', p: 'DF', r: 76 }, { n: 'Balboa', p: 'DF', r: 75 }, { n: 'Dooley', p: 'DF', r: 76 }, { n: 'Clavijo', p: 'DF', r: 72 }, { n: 'Caligiuri', p: 'DF', r: 74 },
      { n: 'Harkes', p: 'MF', r: 77 }, { n: 'Ramos', p: 'MF', r: 78 }, { n: 'Jones', p: 'MF', r: 75 }, { n: 'Sorber', p: 'MF', r: 72 },
      { n: 'Wynalda', p: 'FW', r: 78 }, { n: 'Stewart', p: 'FW', r: 76 }, { n: 'Moore', p: 'FW', r: 71 },
    ],
  },
  {
    c: 'Greece', tr: 'Yunanistan', f: '🇬🇷', y: 2010,
    players: [
      { n: 'Tzorvas', p: 'GK', r: 72 }, { n: 'Chalkias', p: 'GK', r: 70 },
      { n: 'Torosidis', p: 'DF', r: 77 }, { n: 'A. Papadopoulos', p: 'DF', r: 75 }, { n: 'Vyntra', p: 'DF', r: 73 }, { n: 'Seitaridis', p: 'DF', r: 75 }, { n: 'Moras', p: 'DF', r: 72 },
      { n: 'Karagounis', p: 'MF', r: 79 }, { n: 'Katsouranis', p: 'MF', r: 78 }, { n: 'Tziolis', p: 'MF', r: 73 }, { n: 'Ninis', p: 'MF', r: 73 },
      { n: 'Gekas', p: 'FW', r: 77 }, { n: 'Samaras', p: 'FW', r: 78 }, { n: 'Charisteas', p: 'FW', r: 76 }, { n: 'Salpingidis', p: 'FW', r: 76 },
    ],
  },
  {
    c: 'Algeria', tr: 'Cezayir', f: '🇩🇿', y: 2014,
    players: [
      { n: "M'Bolhi", p: 'GK', r: 78 }, { n: 'Zemmamouche', p: 'GK', r: 70 },
      { n: 'Bougherra', p: 'DF', r: 76 }, { n: 'Halliche', p: 'DF', r: 74 }, { n: 'Ghoulam', p: 'DF', r: 78 }, { n: 'Mandi', p: 'DF', r: 75 }, { n: 'Mesbah', p: 'DF', r: 72 },
      { n: 'Brahimi', p: 'MF', r: 80 }, { n: 'Feghouli', p: 'MF', r: 80 }, { n: 'Taïder', p: 'MF', r: 75 }, { n: 'Medjani', p: 'MF', r: 73 }, { n: 'Lacen', p: 'MF', r: 74 },
      { n: 'Slimani', p: 'FW', r: 79 }, { n: 'Soudani', p: 'FW', r: 76 }, { n: 'Djabou', p: 'FW', r: 74 },
    ],
  },
  {
    c: 'Paraguay', tr: 'Paraguay', f: '🇵🇾', y: 2010,
    players: [
      { n: 'Villar', p: 'GK', r: 80 }, { n: 'Bobadilla', p: 'GK', r: 70 },
      { n: 'Da Silva', p: 'DF', r: 75 }, { n: 'Cáceres', p: 'DF', r: 76 }, { n: 'Alcaraz', p: 'DF', r: 75 }, { n: 'Morel', p: 'DF', r: 74 }, { n: 'Verón', p: 'DF', r: 72 },
      { n: 'Riveros', p: 'MF', r: 76 }, { n: 'Vera', p: 'MF', r: 75 }, { n: 'Barreto', p: 'MF', r: 75 }, { n: 'Ortigoza', p: 'MF', r: 74 },
      { n: 'Santa Cruz', p: 'FW', r: 79 }, { n: 'Valdez', p: 'FW', r: 77 }, { n: 'Cardozo', p: 'FW', r: 78 }, { n: 'Benítez', p: 'FW', r: 74 },
    ],
  },
  {
    c: 'Serbia', tr: 'Sırbistan', f: '🇷🇸', y: 2022,
    players: [
      { n: 'V. Milinković-Savić', p: 'GK', r: 76 }, { n: 'Dmitrović', p: 'GK', r: 73 },
      { n: 'Milenković', p: 'DF', r: 78 }, { n: 'Pavlović', p: 'DF', r: 76 }, { n: 'Veljković', p: 'DF', r: 74 }, { n: 'Mladenović', p: 'DF', r: 73 }, { n: 'Babić', p: 'DF', r: 72 },
      { n: 'S. Milinković-Savić', p: 'MF', r: 84 }, { n: 'Tadić', p: 'MF', r: 83 }, { n: 'Kostić', p: 'MF', r: 81 }, { n: 'Lukić', p: 'MF', r: 76 }, { n: 'Gudelj', p: 'MF', r: 75 },
      { n: 'Mitrović', p: 'FW', r: 82 }, { n: 'Vlahović', p: 'FW', r: 82 }, { n: 'Jović', p: 'FW', r: 76 },
    ],
  },
  {
    c: 'Ghana', tr: 'Gana', f: '🇬🇭', y: 2010,
    players: [
      { n: 'Kingson', p: 'GK', r: 74 }, { n: 'Ahorlu', p: 'GK', r: 68 },
      { n: 'John Mensah', p: 'DF', r: 77 }, { n: 'Pantsil', p: 'DF', r: 75 }, { n: 'Sarpei', p: 'DF', r: 73 }, { n: 'Vorsah', p: 'DF', r: 74 }, { n: 'Inkoom', p: 'DF', r: 74 },
      { n: 'K. Asamoah', p: 'MF', r: 79 }, { n: 'Annan', p: 'MF', r: 76 }, { n: 'K.P. Boateng', p: 'MF', r: 80 }, { n: 'Appiah', p: 'MF', r: 78 },
      { n: 'Gyan', p: 'FW', r: 81 }, { n: 'A. Ayew', p: 'FW', r: 79 }, { n: 'Muntari', p: 'FW', r: 79 }, { n: 'Tagoe', p: 'FW', r: 72 },
    ],
  },
  {
    c: 'Morocco', tr: 'Fas', f: '🇲🇦', y: 2022,
    players: [
      { n: 'Bounou', p: 'GK', r: 86 }, { n: 'Munir', p: 'GK', r: 72 },
      { n: 'Hakimi', p: 'DF', r: 86 }, { n: 'Aguerd', p: 'DF', r: 80 }, { n: 'Saïss', p: 'DF', r: 78 }, { n: 'Mazraoui', p: 'DF', r: 81 }, { n: 'Dari', p: 'DF', r: 73 },
      { n: 'Amrabat', p: 'MF', r: 84 }, { n: 'Ounahi', p: 'MF', r: 79 }, { n: 'Amallah', p: 'MF', r: 75 }, { n: 'Sabiri', p: 'MF', r: 74 },
      { n: 'Ziyech', p: 'FW', r: 84 }, { n: 'En-Nesyri', p: 'FW', r: 79 }, { n: 'Boufal', p: 'FW', r: 78 }, { n: 'Aboukhlal', p: 'FW', r: 74 },
    ],
  },
  {
    c: 'Senegal', tr: 'Senegal', f: '🇸🇳', y: 2002,
    players: [
      { n: 'Sylva', p: 'GK', r: 76 }, { n: 'Cissokho', p: 'GK', r: 68 },
      { n: 'Coly', p: 'DF', r: 74 }, { n: 'Daf', p: 'DF', r: 72 }, { n: 'Diatta', p: 'DF', r: 76 }, { n: 'A. Cissé', p: 'DF', r: 76 }, { n: 'P.M. Diop', p: 'DF', r: 73 },
      { n: 'Bouba Diop', p: 'MF', r: 80 }, { n: 'Diao', p: 'MF', r: 78 }, { n: 'Fadiga', p: 'MF', r: 80 }, { n: 'N. Daf', p: 'MF', r: 71 },
      { n: 'El Hadji Diouf', p: 'FW', r: 83 }, { n: 'H. Camara', p: 'FW', r: 79 }, { n: 'Diallo', p: 'FW', r: 73 },
    ],
  },
  {
    c: 'Colombia', tr: 'Kolombiya', f: '🇨🇴', y: 2014,
    players: [
      { n: 'Ospina', p: 'GK', r: 82 }, { n: 'Mondragón', p: 'GK', r: 74 },
      { n: 'Zúñiga', p: 'DF', r: 79 }, { n: 'Yepes', p: 'DF', r: 78 }, { n: 'Armero', p: 'DF', r: 78 }, { n: 'Zapata', p: 'DF', r: 77 }, { n: 'Arias', p: 'DF', r: 75 },
      { n: 'James Rodríguez', p: 'MF', r: 90 }, { n: 'Cuadrado', p: 'MF', r: 84 }, { n: 'C. Sánchez', p: 'MF', r: 77 }, { n: 'Aguilar', p: 'MF', r: 76 }, { n: 'Quintero', p: 'MF', r: 79 },
      { n: 'J. Martínez', p: 'FW', r: 80 }, { n: 'Teo Gutiérrez', p: 'FW', r: 79 }, { n: 'Bacca', p: 'FW', r: 80 },
    ],
  },
  {
    c: 'Colombia', tr: 'Kolombiya', f: '🇨🇴', y: 1994,
    players: [
      { n: 'Córdoba', p: 'GK', r: 76 }, { n: 'Mondragón', p: 'GK', r: 72 },
      { n: 'Escobar', p: 'DF', r: 78 }, { n: 'Perea', p: 'DF', r: 75 }, { n: 'Herrera', p: 'DF', r: 76 }, { n: 'Pérez', p: 'DF', r: 73 }, { n: 'Mendoza', p: 'DF', r: 72 },
      { n: 'Valderrama', p: 'MF', r: 89 }, { n: 'Rincón', p: 'MF', r: 84 }, { n: 'Álvarez', p: 'MF', r: 76 }, { n: 'Gaviria', p: 'MF', r: 74 },
      { n: 'Asprilla', p: 'FW', r: 86 }, { n: 'Valencia', p: 'FW', r: 79 }, { n: 'De Ávila', p: 'FW', r: 78 },
    ],
  },
  {
    c: 'Czechoslovakia', tr: 'Çekoslovakya', f: '🇨🇿', y: 1962,
    players: [
      { n: 'Schrojf', p: 'GK', r: 82 }, { n: 'Kramerius', p: 'GK', r: 70 },
      { n: 'Popluhár', p: 'DF', r: 83 }, { n: 'Novák', p: 'DF', r: 79 }, { n: 'Pluskal', p: 'DF', r: 80 }, { n: 'Tichý', p: 'DF', r: 75 }, { n: 'Lála', p: 'DF', r: 74 },
      { n: 'Masopust', p: 'MF', r: 90 }, { n: 'Kvašňák', p: 'MF', r: 81 }, { n: 'Pospíchal', p: 'MF', r: 77 },
      { n: 'Scherer', p: 'FW', r: 77 }, { n: 'Kadraba', p: 'FW', r: 76 }, { n: 'Jelínek', p: 'FW', r: 78 }, { n: 'Štibrányi', p: 'FW', r: 73 },
    ],
  },
  {
    c: 'Austria', tr: 'Avusturya', f: '🇦🇹', y: 1954,
    players: [
      { n: 'Schmied', p: 'GK', r: 74 }, { n: 'Zeman', p: 'GK', r: 75 },
      { n: 'Happel', p: 'DF', r: 85 }, { n: 'Hanappi', p: 'DF', r: 86 }, { n: 'Barschandt', p: 'DF', r: 74 }, { n: 'Schleger', p: 'DF', r: 72 },
      { n: 'Ocwirk', p: 'MF', r: 88 }, { n: 'Koller', p: 'MF', r: 76 }, { n: 'Wagner', p: 'MF', r: 82 },
      { n: 'Probst', p: 'FW', r: 83 }, { n: 'Stojaspal', p: 'FW', r: 80 }, { n: 'A. Körner', p: 'FW', r: 79 }, { n: 'R. Körner', p: 'FW', r: 77 },
    ],
  },
  {
    c: 'England', tr: 'İngiltere', f: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', y: 2018,
    players: [
      { n: 'Pickford', p: 'GK', r: 82 }, { n: 'Butland', p: 'GK', r: 75 },
      { n: 'Walker', p: 'DF', r: 83 }, { n: 'Stones', p: 'DF', r: 82 }, { n: 'Maguire', p: 'DF', r: 80 }, { n: 'Trippier', p: 'DF', r: 81 }, { n: 'Young', p: 'DF', r: 77 },
      { n: 'Henderson', p: 'MF', r: 81 }, { n: 'Alli', p: 'MF', r: 81 }, { n: 'Lingard', p: 'MF', r: 78 }, { n: 'Loftus-Cheek', p: 'MF', r: 76 },
      { n: 'Kane', p: 'FW', r: 88 }, { n: 'Sterling', p: 'FW', r: 84 }, { n: 'Rashford', p: 'FW', r: 80 }, { n: 'Vardy', p: 'FW', r: 80 },
    ],
  },
  {
    c: 'Chile', tr: 'Şili', f: '🇨🇱', y: 2014,
    players: [
      { n: 'Bravo', p: 'GK', r: 83 }, { n: 'Herrera', p: 'GK', r: 72 },
      { n: 'Medel', p: 'DF', r: 81 }, { n: 'Jara', p: 'DF', r: 78 }, { n: 'Isla', p: 'DF', r: 79 }, { n: 'Mena', p: 'DF', r: 76 }, { n: 'Silva', p: 'DF', r: 74 },
      { n: 'Vidal', p: 'MF', r: 86 }, { n: 'Aránguiz', p: 'MF', r: 80 }, { n: 'Díaz', p: 'MF', r: 78 }, { n: 'Valdivia', p: 'MF', r: 79 },
      { n: 'Alexis Sánchez', p: 'FW', r: 86 }, { n: 'Vargas', p: 'FW', r: 79 }, { n: 'Beausejour', p: 'FW', r: 76 },
    ],
  },
  {
    c: 'Switzerland', tr: 'İsviçre', f: '🇨🇭', y: 2006,
    players: [
      { n: 'Zuberbühler', p: 'GK', r: 76 }, { n: 'Coltorti', p: 'GK', r: 70 },
      { n: 'P. Senderos', p: 'DF', r: 78 }, { n: 'Müller', p: 'DF', r: 76 }, { n: 'Magnin', p: 'DF', r: 74 }, { n: 'Degen', p: 'DF', r: 73 }, { n: 'Spycher', p: 'DF', r: 73 },
      { n: 'Vogel', p: 'MF', r: 77 }, { n: 'Cabanas', p: 'MF', r: 76 }, { n: 'Barnetta', p: 'MF', r: 78 }, { n: 'Wicky', p: 'MF', r: 74 },
      { n: 'Frei', p: 'FW', r: 80 }, { n: 'Streller', p: 'FW', r: 75 }, { n: 'Yakin', p: 'FW', r: 78 },
    ],
  },
  {
    c: 'Australia', tr: 'Avustralya', f: '🇦🇺', y: 2006,
    players: [
      { n: 'Schwarzer', p: 'GK', r: 80 }, { n: 'Kalac', p: 'GK', r: 73 },
      { n: 'Neill', p: 'DF', r: 78 }, { n: 'Moore', p: 'DF', r: 75 }, { n: 'Chipperfield', p: 'DF', r: 74 }, { n: 'Emerton', p: 'DF', r: 77 }, { n: 'Popovic', p: 'DF', r: 73 },
      { n: 'Grella', p: 'MF', r: 76 }, { n: 'Culina', p: 'MF', r: 75 }, { n: 'Cahill', p: 'MF', r: 81 }, { n: 'Bresciano', p: 'MF', r: 77 },
      { n: 'Viduka', p: 'FW', r: 80 }, { n: 'Kewell', p: 'FW', r: 81 }, { n: 'Aloisi', p: 'FW', r: 75 },
    ],
  },
  {
    c: 'Brazil', tr: 'Brezilya', f: '🇧🇷', y: 1998,
    players: [
      { n: 'Taffarel', p: 'GK', r: 84 }, { n: 'Dida', p: 'GK', r: 78 },
      { n: 'Cafu', p: 'DF', r: 89 }, { n: 'Roberto Carlos', p: 'DF', r: 90 }, { n: 'Aldair', p: 'DF', r: 86 }, { n: 'Júnior Baiano', p: 'DF', r: 80 }, { n: 'Zé Carlos', p: 'DF', r: 75 },
      { n: 'Dunga', p: 'MF', r: 86 }, { n: 'Rivaldo', p: 'MF', r: 92 }, { n: 'Leonardo', p: 'MF', r: 84 }, { n: 'César Sampaio', p: 'MF', r: 81 }, { n: 'Emerson', p: 'MF', r: 80 },
      { n: 'Ronaldo', p: 'FW', r: 96 }, { n: 'Bebeto', p: 'FW', r: 85 }, { n: 'Edmundo', p: 'FW', r: 82 },
    ],
  },
  {
    c: 'Argentina', tr: 'Arjantin', f: '🇦🇷', y: 1998,
    players: [
      { n: 'Roa', p: 'GK', r: 82 }, { n: 'Burgos', p: 'GK', r: 75 },
      { n: 'Ayala', p: 'DF', r: 85 }, { n: 'Zanetti', p: 'DF', r: 86 }, { n: 'Sensini', p: 'DF', r: 79 }, { n: 'Chamot', p: 'DF', r: 78 }, { n: 'Vivas', p: 'DF', r: 74 },
      { n: 'Verón', p: 'MF', r: 87 }, { n: 'Simeone', p: 'MF', r: 85 }, { n: 'Ortega', p: 'MF', r: 86 }, { n: 'Almeyda', p: 'MF', r: 79 },
      { n: 'Batistuta', p: 'FW', r: 92 }, { n: 'Crespo', p: 'FW', r: 84 }, { n: 'López', p: 'FW', r: 81 },
    ],
  },
];

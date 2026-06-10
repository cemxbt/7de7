// Adds the remaining 37 squads of the real 48-team 2026 World Cup.
// Sources: ESPN final squad lists (June 2, 2026) + curated ratings.
// Run: node scripts/gen2026.mjs
import fs from 'node:fs';

const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// row: [name, force, 'POS POS', no?, legend?]  (no = 0 -> auto)
function T(sel, rows) {
  const used = new Set(rows.map(r => r[3]).filter(Boolean));
  let gkPref = [1, 12, 23].filter(n => !used.has(n));
  let next = 2;
  const auto = isGK => {
    if (isGK && gkPref.length) { const n = gkPref.shift(); used.add(n); return n; }
    while (used.has(next)) next++;
    used.add(next);
    return next;
  };
  return {
    sel, copa: 2026,
    squad: rows.map(([n, f, pos, no, leg]) => ({
      id: slug(n), n, pos: pos.split(' '), no: no || auto(pos.startsWith('GK')), f,
      ...(leg ? { leg: true } : {}),
    })),
  };
}

const SQUADS = [
  // ---- Group A ----
  T('MEX', [
    ['Luis Malagón', 78, 'GK'], ['Raúl Rangel', 73, 'GK'],
    ['Julián Araujo', 76, 'RB'], ['Israel Reyes', 74, 'CB RB'],
    ['César Montes', 79, 'CB'], ['Johan Vásquez', 80, 'CB'], ['Jesús Gallardo', 76, 'LB'],
    ['Edson Álvarez', 82, 'DM CB'], ['Luis Chávez', 78, 'CM DM'], ['Erik Lira', 75, 'DM'],
    ['Marcel Ruiz', 76, 'CM'], ['Orbelín Pineda', 77, 'AM LW'], ['Roberto Alvarado', 77, 'RW AM'],
    ['Hirving Lozano', 80, 'RW LW'], ['Alexis Vega', 79, 'LW AM'], ['Julián Quiñones', 78, 'ST LW'],
    ['Santiago Giménez', 82, 'ST', 9], ['Raúl Jiménez', 80, 'ST'],
  ]),
  T('RSA', [
    ['Ronwen Williams', 77, 'GK'], ['Sipho Chaine', 71, 'GK'],
    ['Khuliso Mudau', 74, 'RB'], ['Nkosinathi Sibisi', 72, 'CB'], ['Grant Kekana', 72, 'CB'],
    ['Siyabonga Ngezana', 72, 'CB'], ['Aubrey Modiba', 73, 'LB LM'],
    ['Teboho Mokoena', 77, 'CM DM'], ['Bathusi Aubaas', 72, 'DM CM'], ['Sphephelo Sithole', 72, 'CM'],
    ['Themba Zwane', 74, 'AM', 10], ['Relebohile Mofokeng', 77, 'LW AM'], ['Oswin Appollis', 75, 'LW RW'],
    ['Percy Tau', 76, 'RW AM'], ['Mihlali Mayambela', 71, 'RW'],
    ['Lyle Foster', 77, 'ST', 9], ['Evidence Makgopa', 72, 'ST'], ['Iqraam Rayners', 73, 'ST'],
  ]),
  T('KOR', [
    ['Jo Hyun-woo', 77, 'GK'], ['Kim Seung-gyu', 74, 'GK'],
    ['Kim Moon-hwan', 73, 'RB'], ['Seol Young-woo', 76, 'LB RB'], ['Lee Tae-seok', 72, 'RB'],
    ['Kim Min-jae', 85, 'CB', 4], ['Lee Han-beom', 74, 'CB'], ['Jo Yu-min', 73, 'CB'],
    ['Jens Castrop', 75, 'DM CM'], ['Hwang In-beom', 79, 'CM DM'], ['Paik Seung-ho', 76, 'CM DM'],
    ['Lee Jae-sung', 77, 'AM CM'], ['Lee Kang-in', 83, 'AM RW', 18], ['Yang Hyun-jun', 76, 'LW RW'],
    ['Hwang Hee-chan', 80, 'RW ST', 11], ['Son Heung-min', 85, 'LW ST', 7, 1],
    ['Cho Kyu-sung', 76, 'ST', 9], ['Oh Hyun-kyu', 75, 'ST'],
  ]),
  T('CZE', [
    ['Jindřich Staněk', 76, 'GK'], ['Lukáš Horníček', 73, 'GK'],
    ['Vladimír Coufal', 76, 'RB'], ['David Douděra', 73, 'RB RM'],
    ['Robin Hranáč', 76, 'CB'], ['David Zima', 74, 'CB'], ['Ladislav Krejčí', 79, 'CB DM'],
    ['David Jurásek', 74, 'LB'], ['Tomáš Holeš', 74, 'DM CB'],
    ['Tomáš Souček', 80, 'CM DM'], ['Michal Sadílek', 74, 'CM DM'], ['Lukáš Červ', 74, 'CM'],
    ['Lukáš Provod', 77, 'AM LM', 10], ['Adam Hložek', 78, 'ST AM'],
    ['Patrik Schick', 83, 'ST', 11], ['Tomáš Chorý', 75, 'ST'], ['Jan Kuchta', 74, 'ST LW'],
    ['Mojmír Chytil', 73, 'ST'],
  ]),
  // ---- Group B ----
  T('CAN', [
    ['Dayne St. Clair', 75, 'GK'], ['Maxime Crépeau', 74, 'GK'],
    ['Alistair Johnston', 78, 'RB'], ['Richie Laryea', 75, 'RB RM'],
    ['Moïse Bombito', 77, 'CB'], ['Derek Cornelius', 74, 'CB'], ['Kamal Miller', 74, 'CB LB'],
    ['Alphonso Davies', 86, 'LB LW', 19], ['Jacob Shaffelburg', 76, 'LW LM'],
    ['Stephen Eustáquio', 78, 'DM CM'], ['Ismaël Koné', 77, 'CM'], ['Jonathan Osorio', 75, 'CM AM'],
    ['Mathieu Choinière', 73, 'CM'], ['Tajon Buchanan', 78, 'RW LW', 11],
    ['Jonathan David', 84, 'ST', 10], ['Cyle Larin', 77, 'ST'], ['Promise David', 76, 'ST'],
    ['Ali Ahmed', 74, 'LW LM'],
  ]),
  T('BIH', [
    ['Nikola Vasilj', 76, 'GK'], ['Martin Zlomislić', 71, 'GK'],
    ['Amar Dedić', 77, 'RB'], ['Jusuf Gazibegović', 72, 'RB'],
    ['Sead Kolašinac', 76, 'CB LB'], ['Tarik Muharemović', 75, 'CB'], ['Dennis Hadžikadunić', 73, 'CB'],
    ['Nihad Mujakić', 71, 'CB'], ['Ivan Šunjić', 74, 'DM CM'], ['Amir Hadžiahmetović', 74, 'CM'],
    ['Benjamin Tahirović', 75, 'CM DM'], ['Armin Gigović', 74, 'CM LM'],
    ['Kerim Alajbegović', 75, 'AM LW'], ['Esmir Bajraktarević', 75, 'RW AM'], ['Amar Memić', 74, 'RM RW'],
    ['Edin Džeko', 78, 'ST', 11, 1], ['Ermedin Demirović', 79, 'ST', 9], ['Haris Tabaković', 75, 'ST'],
  ]),
  T('QAT', [
    ['Meshaal Barsham', 74, 'GK'], ['Salah Zakaria', 72, 'GK'],
    ['Pedro Miguel', 72, 'RB CB'], ['Homam Al-Amin', 71, 'RB'],
    ['Boualem Khoukhi', 73, 'CB DM'], ['Lucas Mendes', 73, 'CB LB'], ['Ayoub Al-Alawi', 69, 'CB'],
    ['Sultan Al-Brake', 70, 'LB'], ['Karim Boudiaf', 72, 'DM'], ['Assim Madibo', 71, 'DM'],
    ['Abdulaziz Hatem', 73, 'CM AM'], ['Jassim Gaber', 70, 'CM'], ['Ahmed Fathy', 70, 'RM CM'],
    ['Akram Afif', 81, 'LW AM', 11, 1], ['Hassan Al-Haydos', 73, 'AM RW', 10],
    ['Edmilson Junior', 74, 'RW LW'], ['Almoez Ali', 78, 'ST', 19], ['Mohammed Muntari', 72, 'ST'],
    ['Yusuf Abdurisag', 71, 'RW LW'],
  ]),
  T('SUI', [
    ['Gregor Kobel', 85, 'GK'], ['Yvon Mvogo', 74, 'GK'],
    ['Silvan Widmer', 75, 'RB'], ['Manuel Akanji', 84, 'CB', 5], ['Nico Elvedi', 77, 'CB'],
    ['Aurèle Amenda', 75, 'CB'], ['Luca Jaquez', 74, 'CB'],
    ['Ricardo Rodríguez', 75, 'LB'], ['Miro Muheim', 75, 'LB'],
    ['Granit Xhaka', 84, 'CM DM', 10], ['Remo Freuler', 78, 'CM'], ['Denis Zakaria', 80, 'DM CM'],
    ['Ardon Jashari', 80, 'CM DM'], ['Djibril Sow', 77, 'CM'], ['Fabian Rieder', 77, 'AM CM'],
    ['Johan Manzambi', 77, 'AM RM'], ['Rubén Vargas', 78, 'LW RW'], ['Dan Ndoye', 80, 'RW LW'],
    ['Breel Embolo', 79, 'ST', 9], ['Noah Okafor', 78, 'LW ST'], ['Zeki Amdouni', 76, 'ST AM'],
  ]),
  // ---- Group C ----
  T('MAR', [
    ['Yassine Bounou', 84, 'GK'], ['Munir Mohamedi', 73, 'GK'],
    ['Achraf Hakimi', 88, 'RB RW', 2, 1], ['Noussair Mazraoui', 81, 'LB RB'],
    ['Nayef Aguerd', 81, 'CB', 5], ['Romain Saïss', 73, 'CB'], ['Jawad El Yamiq', 74, 'CB'],
    ['Adam Aznou', 75, 'LB'], ['Sofyan Amrabat', 80, 'DM', 4],
    ['Azzedine Ounahi', 78, 'CM AM'], ['Ismael Saibari', 80, 'CM AM'], ['Bilal El Khannouss', 81, 'AM'],
    ['Brahim Díaz', 84, 'AM RW', 10], ['Hakim Ziyech', 76, 'RW AM'], ['Eliesse Ben Seghir', 79, 'AM LW'],
    ['Soufiane Rahimi', 77, 'LW ST'], ['Abde Ezzalzouli', 78, 'LW'],
    ['Youssef En-Nesyri', 81, 'ST', 19], ['Ayoub El Kaabi', 78, 'ST', 9],
  ]),
  T('HAI', [
    ['Johny Placide', 70, 'GK'], ['Alexandre Pierre', 67, 'GK'],
    ['Carlens Arcus', 70, 'RB'], ['Ricardo Adé', 71, 'CB'], ['Jean-Kévin Duverne', 70, 'CB'],
    ['Garven Metusala', 69, 'CB LB'], ['Bryan Alceus', 69, 'DM CM'],
    ['Danley Jean Jacques', 73, 'CM DM'], ['Leverton Pierre', 70, 'DM CM'], ['Carl Fred Sainté', 70, 'DM'],
    ['Mondy Prunier', 68, 'AM CM'], ['Don Deedson Louicius', 72, 'RW AM', 10],
    ['Derrick Etienne', 71, 'LW RW'], ['Ruben Providence', 69, 'RW'], ['Fafà Picault', 69, 'LW ST'],
    ['Duckens Nazon', 71, 'ST', 9], ['Frantzdy Pierrot', 73, 'ST', 20], ['Josué Casimir', 71, 'ST LW'],
  ]),
  T('SCO', [
    ['Angus Gunn', 75, 'GK'], ['Craig Gordon', 72, 'GK'],
    ['Aaron Hickey', 77, 'RB'], ['Anthony Ralston', 72, 'RB'],
    ['Jack Hendry', 73, 'CB'], ['Grant Hanley', 72, 'CB'], ['John Souttar', 74, 'CB'],
    ['Kieran Tierney', 77, 'LB CB'], ['Andy Robertson', 81, 'LB', 3],
    ['Billy Gilmour', 78, 'CM DM'], ['Scott McTominay', 84, 'CM AM', 8], ['John McGinn', 79, 'CM LM', 7],
    ['Lewis Ferguson', 78, 'CM'], ['Lennon Miller', 76, 'CM'],
    ['Ryan Christie', 76, 'AM RW'], ['Ben Doak', 77, 'RW', 11],
    ['Che Adams', 76, 'ST', 9], ['Lawrence Shankland', 74, 'ST'], ['George Hirst', 73, 'ST'],
  ]),
  // ---- Group D ----
  T('USA', [
    ['Matt Turner', 76, 'GK'], ['Matt Freese', 74, 'GK'],
    ['Sergiño Dest', 79, 'RB RW', 2], ['Joe Scally', 75, 'RB LB'],
    ['Chris Richards', 79, 'CB', 3], ['Cameron Carter-Vickers', 76, 'CB'], ['Tim Ream', 74, 'CB LB'],
    ['Antonee Robinson', 81, 'LB', 5], ['Tyler Adams', 80, 'DM', 4],
    ['Weston McKennie', 81, 'CM DM', 8], ['Yunus Musah', 79, 'CM RM', 6],
    ['Malik Tillman', 79, 'AM CM'], ['Gio Reyna', 78, 'AM RW', 7], ['Diego Luna', 76, 'AM LW'],
    ['Christian Pulisic', 86, 'LW AM RW', 10], ['Tim Weah', 79, 'RW RB', 21],
    ['Folarin Balogun', 80, 'ST', 20], ['Ricardo Pepi', 79, 'ST', 9],
  ]),
  T('PAR', [
    ['Roberto Fernández', 74, 'GK'], ['Orlando Gill', 72, 'GK'],
    ['Juan Cáceres', 73, 'RB'], ['Gustavo Gómez', 78, 'CB', 5], ['Omar Alderete', 78, 'CB'],
    ['Junior Alonso', 77, 'CB LB'], ['Agustín Sández', 73, 'LB'],
    ['Mathías Villasanti', 77, 'CM DM'], ['Andrés Cubas', 76, 'DM'], ['Damián Bobadilla', 75, 'CM'],
    ['Diego Gómez', 78, 'CM AM'], ['Alejandro Romero', 74, 'AM'],
    ['Miguel Almirón', 79, 'RW AM', 10], ['Julio Enciso', 79, 'AM LW', 7], ['Ramón Sosa', 76, 'LW'],
    ['Tony Sanabria', 76, 'ST', 9], ['Isidro Pitta', 74, 'ST'], ['Gabriel Ávalos', 73, 'ST'],
  ]),
  T('AUS', [
    ['Mat Ryan', 76, 'GK'], ['Joe Gauci', 72, 'GK'],
    ['Lewis Miller', 72, 'RB'], ['Harry Souttar', 76, 'CB', 19], ['Alessandro Circati', 76, 'CB'],
    ['Cameron Burgess', 73, 'CB'], ['Kye Rowles', 73, 'CB LB'], ['Aziz Behich', 73, 'LB'],
    ['Jordan Bos', 74, 'LB LW'], ['Jackson Irvine', 76, 'CM AM', 22], ["Aiden O'Neill", 73, 'DM'],
    ['Connor Metcalfe', 73, 'CM LM'], ['Riley McGree', 75, 'AM CM', 8], ['Patrick Yazbek', 72, 'CM'],
    ['Martin Boyle', 74, 'RW', 7], ['Craig Goodwin', 74, 'LW'], ['Nestory Irankunda', 74, 'RW'],
    ['Kusini Yengi', 74, 'ST', 9], ['Mitchell Duke', 72, 'ST'], ['Nishan Velupillay', 73, 'LW ST'],
  ]),
  // ---- Group E ----
  T('CUW', [
    ['Eloy Room', 72, 'GK'], ['Trevor Doornbusch', 68, 'GK'],
    ['Shurandy Sambo', 72, 'RB'], ['Joshua Brenet', 72, 'RB CB'], ['Sherel Floranus', 70, 'RB CB'],
    ['Armando Obispo', 74, 'CB'], ['Roshon van Eijma', 70, 'CB'], ['Deveron Fonville', 69, 'CB'],
    ['Riechedly Bazoer', 75, 'DM CB', 6], ['Leandro Bacuna', 72, 'CM RM'],
    ['Juninho Bacuna', 74, 'AM CM', 10], ['Livano Comenencia', 72, 'CM RB'],
    ['Godfried Roemeratoe', 70, 'DM'], ['Kevin Felida', 69, 'CM'],
    ['Tahith Chong', 74, 'RW AM', 7], ['Sontje Hansen', 73, 'RW LW', 11],
    ['Jurgen Locadia', 72, 'ST', 9], ['Kenji Gorré', 69, 'LW'], ['Jeremy Antonisse', 70, 'LW ST'],
  ]),
  T('CIV', [
    ['Yahia Fofana', 76, 'GK'], ['Badra Ali Sangaré', 71, 'GK'],
    ['Wilfried Singo', 78, 'RB CB'], ['Guéla Doué', 75, 'RB'],
    ['Odilon Kossounou', 78, 'CB'], ['Evan Ndicka', 80, 'CB'], ['Emmanuel Agbadou', 76, 'CB'],
    ['Ghislain Konan', 74, 'LB'], ['Franck Kessié', 80, 'CM DM'], ['Ibrahim Sangaré', 78, 'DM'],
    ['Seko Fofana', 79, 'CM AM'], ['Jean-Philippe Krasso', 74, 'AM ST'],
    ['Simon Adingra', 79, 'LW RW'], ['Amad Diallo', 81, 'RW AM', 11], ['Nicolas Pépé', 78, 'RW', 19],
    ['Jonathan Bamba', 75, 'LW'], ['Sébastien Haller', 77, 'ST', 22], ['Oumar Diakité', 75, 'ST RW'],
  ]),
  // ---- Group F ----
  T('JPN', [
    ['Zion Suzuki', 79, 'GK'], ['Kosei Tani', 73, 'GK'],
    ['Yukinari Sugawara', 78, 'RB'], ['Takehiro Tomiyasu', 79, 'CB RB'],
    ['Ko Itakura', 79, 'CB'], ['Koki Machida', 77, 'CB'], ['Hiroki Ito', 78, 'CB LB'],
    ['Ryoya Morishita', 75, 'LB LM'], ['Kaishu Sano', 76, 'DM'],
    ['Wataru Endo', 80, 'DM CB', 6], ['Hidemasa Morita', 79, 'CM DM'], ['Ao Tanaka', 78, 'CM'],
    ['Daichi Kamada', 80, 'AM CM'], ['Takefusa Kubo', 85, 'RW AM', 11],
    ['Kaoru Mitoma', 85, 'LW', 7], ['Junya Ito', 80, 'RW RM'], ['Takumi Minamino', 79, 'AM LW', 10],
    ['Keito Nakamura', 79, 'LW'], ['Ayase Ueda', 79, 'ST', 9], ['Kyogo Furuhashi', 77, 'ST'],
  ]),
  T('SWE', [
    ['Viktor Johansson', 77, 'GK'], ['Jacob Widell Zetterström', 73, 'GK'],
    ['Emil Holm', 77, 'RB'], ['Victor Lindelöf', 75, 'CB'], ['Isak Hien', 79, 'CB'],
    ['Carl Starfelt', 75, 'CB'], ['Ludwig Augustinsson', 73, 'LB'], ['Samuel Dahl', 75, 'LB'],
    ['Lucas Bergvall', 81, 'CM AM', 8], ['Jens Cajuste', 76, 'CM DM'], ['Hugo Larsson', 80, 'CM'],
    ['Anton Salétros', 73, 'DM'], ['Yasin Ayari', 78, 'CM AM'],
    ['Dejan Kulusevski', 83, 'RW AM', 21], ['Anthony Elanga', 81, 'RW LW', 7],
    ['Alexander Isak', 88, 'ST', 9], ['Viktor Gyökeres', 88, 'ST', 11], ['Benjamin Nygren', 75, 'AM ST'],
    ['Gustaf Nilsson', 74, 'ST'],
  ]),
  T('TUN', [
    ['Aymen Dahmen', 73, 'GK'], ['Béchir Ben Saïd', 71, 'GK'],
    ['Yan Valery', 73, 'RB'], ['Montassar Talbi', 77, 'CB'], ['Dylan Bronn', 74, 'CB'],
    ['Yassine Meriah', 73, 'CB'], ['Ali Abdi', 75, 'LB LM'],
    ['Aïssa Laïdouni', 75, 'CM DM'], ['Ellyes Skhiri', 77, 'DM CM'], ['Ferjani Sassi', 72, 'CM'],
    ['Hannibal Mejbri', 75, 'AM CM', 8], ['Mohamed Ali Ben Romdhane', 75, 'CM'],
    ['Elias Achouri', 75, 'LW RW'], ['Anis Ben Slimane', 74, 'AM RM'],
    ['Youssef Msakni', 73, 'LW AM', 10, 1], ['Elias Saad', 76, 'LW', 11],
    ['Seifeddine Jaziri', 73, 'ST', 9], ['Firas Chaouat', 71, 'ST'],
  ]),
  // ---- Group G ----
  T('EGY', [
    ['Mohamed El Shenawy', 76, 'GK'], ['Mostafa Shobeir', 72, 'GK'],
    ['Mohamed Hany', 73, 'RB'], ['Omar Kamal', 72, 'RB'],
    ['Mohamed Abdelmonem', 76, 'CB'], ['Ahmed Hegazi', 73, 'CB'], ['Rami Rabia', 72, 'CB'],
    ['Ahmed Fattouh', 73, 'LB'], ['Hamdy Fathy', 73, 'DM CM'], ['Marwan Attia', 74, 'DM'],
    ['Mohamed Elneny', 73, 'CM'], ['Emam Ashour', 77, 'CM AM'],
    ['Mahmoud Trezeguet', 76, 'RW LW', 7], ['Zizo', 77, 'RW AM'], ['Ibrahim Adel', 76, 'LW RW'],
    ['Mohamed Salah', 89, 'RW', 10, 1], ['Omar Marmoush', 85, 'ST LW', 11],
    ['Mostafa Mohamed', 76, 'ST', 9],
  ]),
  T('IRN', [
    ['Alireza Beiranvand', 77, 'GK'], ['Hossein Hosseini', 74, 'GK'],
    ['Saleh Hardani', 73, 'RB'], ['Ramin Rezaeian', 74, 'RB'],
    ['Shoja Khalilzadeh', 73, 'CB'], ['Hossein Kanaani', 73, 'CB'], ['Rouzbeh Cheshmi', 74, 'DM CB'],
    ['Milad Mohammadi', 73, 'LB'], ['Ehsan Hajsafi', 72, 'LB CM'],
    ['Saeid Ezatolahi', 74, 'DM'], ['Saman Ghoddos', 75, 'AM CM'], ['Mehdi Torabi', 75, 'RM AM'],
    ['Alireza Jahanbakhsh', 76, 'RW AM', 7], ['Mohammad Mohebi', 75, 'LW'],
    ['Mehdi Ghaedi', 77, 'LW AM', 10], ['Mehdi Taremi', 84, 'ST', 9, 1],
    ['Ali Alipour', 74, 'ST'], ['Amirhossein Hosseinzadeh', 74, 'RW ST'],
  ]),
  T('NZL', [
    ['Max Crocombe', 71, 'GK'], ['Oliver Sail', 69, 'GK'],
    ['Tim Payne', 70, 'RB'], ['Finn Surman', 72, 'CB'], ['Michael Boxall', 71, 'CB'],
    ['Tyler Bindon', 73, 'CB'], ['Liberato Cacace', 76, 'LB LM', 3],
    ['Joe Bell', 74, 'DM'], ['Marko Stamenic', 74, 'CM'], ['Matt Garbett', 73, 'CM AM'],
    ['Sarpreet Singh', 73, 'AM', 10], ['Elijah Just', 72, 'LW AM'], ['Callum McCowatt', 72, 'RW LW'],
    ['Ben Old', 73, 'RW LW'], ['Chris Wood', 81, 'ST', 9], ['Kosta Barbarouses', 70, 'RW ST'],
    ['André de Jong', 71, 'ST'], ['Ben Waine', 71, 'ST'],
  ]),
  // ---- Group H ----
  T('CPV', [
    ['Vozinha', 72, 'GK'], ['Márcio Rosa', 69, 'GK'],
    ['Steven Moreira', 75, 'RB'], ['Wagner Pina', 72, 'RB'],
    ['Logan Costa', 78, 'CB', 4], ['Sidny Lopes Cabral', 72, 'CB'], ['João Paulo', 71, 'CB'],
    ['Diney', 69, 'CB'], ['Stopira', 69, 'LB CB'],
    ['Kevin Pina', 74, 'DM CM'], ['Jamiro Monteiro', 74, 'CM AM', 8], ['Deroy Duarte', 72, 'CM'],
    ['Laros Duarte', 72, 'DM CM'], ['Telmo Arcanjo', 72, 'AM CM', 10],
    ['Ryan Mendes', 73, 'LW RW', 7], ['Garry Rodrigues', 71, 'LW'], ['Jovane Cabral', 72, 'LW ST'],
    ['Willy Semedo', 71, 'ST RW'], ['Dailon Livramento', 72, 'ST', 9],
  ]),
  T('KSA', [
    ['Mohammed Al-Owais', 76, 'GK'], ['Nawaf Al-Aqidi', 72, 'GK'],
    ['Sultan Al-Ghannam', 73, 'RB'], ['Saud Abdulhamid', 74, 'RB'], ['Nawaf Boushal', 71, 'RB RM'],
    ['Hassan Tambakti', 75, 'CB', 5], ['Ali Lajami', 73, 'CB'], ['Abdulelah Al-Amri', 72, 'CB'],
    ['Hassan Kadesh', 71, 'CB'], ['Moteb Al-Harbi', 71, 'LB'],
    ['Mohammed Kanno', 75, 'CM DM', 23], ['Abdullah Al-Khaibari', 72, 'DM'],
    ['Nasser Al-Dawsari', 73, 'CM'], ['Musab Al-Juwayr', 74, 'AM CM'],
    ['Salem Al-Dawsari', 80, 'LW AM', 10, 1], ['Khalid Al-Ghannam', 71, 'RW'],
    ['Ayman Yahya', 72, 'RW LW'], ['Firas Al-Buraikan', 76, 'ST', 9], ['Saleh Al-Shehri', 73, 'ST'],
    ['Abdullah Al-Hamdan', 72, 'ST'],
  ]),
  T('URU', [
    ['Sergio Rochet', 80, 'GK'], ['Fernando Muslera', 76, 'GK'],
    ['Guillermo Varela', 75, 'RB'], ['Ronald Araújo', 86, 'CB RB', 4],
    ['José María Giménez', 82, 'CB', 2], ['Sebastián Cáceres', 76, 'CB'], ['Santiago Bueno', 78, 'CB'],
    ['Mathías Olivera', 81, 'LB CB'], ['Joaquín Piquerez', 80, 'LB'], ['Matías Viña', 76, 'LB'],
    ['Federico Valverde', 89, 'CM DM RM', 15, 1], ['Rodrigo Bentancur', 84, 'CM DM', 6],
    ['Manuel Ugarte', 83, 'DM', 5], ['Emiliano Martínez Toranza', 75, 'CM'],
    ['Rodrigo Zalazar', 77, 'AM LM'], ['Giorgian De Arrascaeta', 82, 'AM', 10],
    ['Nicolás De La Cruz', 81, 'AM RW', 7], ['Maximiliano Araújo', 79, 'LW LM'],
    ['Brian Rodríguez', 76, 'LW RW'], ['Facundo Pellistri', 76, 'RW'], ['Agustín Canobbio', 77, 'RW LW'],
    ['Darwin Núñez', 85, 'ST', 9], ['Federico Viñas', 74, 'ST'], ['Rodrigo Aguirre', 74, 'ST'],
  ]),
  // ---- Group I ----
  T('SEN', [
    ['Édouard Mendy', 81, 'GK'], ['Yehvann Diouf', 74, 'GK'],
    ['Krépin Diatta', 77, 'RB RW'], ['Antoine Mendy', 74, 'RB'],
    ['Kalidou Koulibaly', 80, 'CB', 3], ['Moussa Niakhaté', 78, 'CB'], ['Abdou Diallo', 76, 'CB LB'],
    ['El Hadji Malick Diouf', 77, 'LB'], ['Idrissa Gana Gueye', 78, 'DM CM', 5],
    ['Pape Matar Sarr', 81, 'CM', 17], ['Lamine Camara', 80, 'CM DM'], ['Pape Gueye', 76, 'CM DM'],
    ['Habib Diarra', 79, 'CM AM'], ['Iliman Ndiaye', 81, 'AM LW', 10],
    ['Ismaïla Sarr', 80, 'RW LW', 18], ['Sadio Mané', 82, 'LW ST', 11, 1],
    ['Nicolas Jackson', 81, 'ST', 9], ['Boulaye Dia', 77, 'ST'],
  ]),
  T('IRQ', [
    ['Jalal Hassan', 71, 'GK'], ['Fahad Talib', 70, 'GK'],
    ['Hussein Ali', 73, 'RB'], ['Manaf Younis', 71, 'CB'], ['Rebin Sulaka', 71, 'CB'],
    ['Zaid Tahseen', 72, 'CB'], ['Frans Putros', 72, 'CB'], ['Merchas Doski', 73, 'CB LB'],
    ['Mustafa Saadoon', 70, 'LB'], ['Amir Al-Ammari', 73, 'CM DM'],
    ['Zidane Iqbal', 76, 'CM AM', 8], ['Aimar Sher', 72, 'CM'], ['Kevin Yakob', 72, 'AM RW'],
    ['Ibrahim Bayesh', 75, 'AM LW', 10], ['Youssef Amyn', 73, 'RW AM'],
    ['Ali Jasim', 75, 'RW LW', 7], ['Ali Al-Hamadi', 76, 'ST', 9], ['Aymen Hussein', 75, 'ST'],
    ['Mohanad Ali', 74, 'ST'],
  ]),
  T('NOR', [
    ['Ørjan Nyland', 75, 'GK'], ['Egil Selvik', 72, 'GK'],
    ['Julian Ryerson', 78, 'RB LB'], ['Kristoffer Ajer', 77, 'CB RB'],
    ['Leo Østigård', 76, 'CB'], ['Torbjørn Heggem', 75, 'CB'], ['David Møller Wolfe', 76, 'LB'],
    ['Sander Berge', 78, 'CM DM', 6], ['Patrick Berg', 76, 'DM'], ['Morten Thorsby', 74, 'CM'],
    ['Fredrik Aursnes', 78, 'CM LB'], ['Martin Ødegaard', 87, 'AM CM', 10],
    ['Antonio Nusa', 81, 'LW RW', 11], ['Oscar Bobb', 79, 'RW AM'], ['Aron Dønnum', 74, 'RW LW'],
    ['Erling Haaland', 93, 'ST', 9, 1], ['Alexander Sørloth', 81, 'ST'],
    ['Jørgen Strand Larsen', 80, 'ST'],
  ]),
  // ---- Group J ----
  T('ALG', [
    ['Luca Zidane', 73, 'GK'], ['Oussama Benbot', 71, 'GK'],
    ['Rafik Belghali', 74, 'RB'], ['Aïssa Mandi', 76, 'CB'], ['Mohamed Amine Tougaï', 74, 'CB'],
    ['Zinedine Belaïd', 72, 'CB'], ['Rayan Aït-Nouri', 84, 'LB LW', 3],
    ['Ramy Bensebaini', 80, 'LB CB'], ['Jaouen Hadjam', 75, 'LB'],
    ['Nabil Bentaleb', 76, 'DM CM'], ['Ramiz Zerrouki', 75, 'DM'], ['Hicham Boudaoui', 77, 'CM'],
    ['Houssem Aouar', 78, 'AM CM'], ['Fares Chaïbi', 78, 'AM LW'], ['Ibrahim Maza', 78, 'AM'],
    ['Riyad Mahrez', 82, 'RW', 7, 1], ['Anis Hadj Moussa', 78, 'RW'],
    ['Amine Gouiri', 80, 'ST LW', 9], ['Mohamed Amine Amoura', 81, 'ST RW', 11],
    ['Adil Boulbina', 73, 'ST'],
  ]),
  T('AUT', [
    ['Alexander Schlager', 76, 'GK'], ['Patrick Pentz', 75, 'GK'],
    ['Stefan Posch', 77, 'RB CB'], ['Konrad Laimer', 81, 'CM RB'],
    ['Kevin Danso', 80, 'CB', 4], ['Philipp Lienhart', 78, 'CB'], ['David Affengruber', 74, 'CB'],
    ['Michael Svoboda', 73, 'CB'], ['David Alaba', 80, 'CB LB', 8, 1], ['Marco Friedl', 76, 'CB LB'],
    ['Phillipp Mwene', 75, 'LB RB'], ['Alexander Prass', 76, 'LB LM'],
    ['Xaver Schlager', 81, 'CM DM'], ['Nicolas Seiwald', 80, 'DM'], ['Marcel Sabitzer', 80, 'CM AM', 9],
    ['Florian Grillitsch', 75, 'DM CM'], ['Romano Schmid', 77, 'AM'],
    ['Christoph Baumgartner', 81, 'AM ST', 10], ['Carney Chukwuemeka', 78, 'CM AM'],
    ['Patrick Wimmer', 77, 'RW LW'], ['Paul Wanner', 78, 'AM LW'],
    ['Marko Arnautović', 77, 'ST', 7], ['Michael Gregoritsch', 75, 'ST'], ['Saša Kalajdžić', 74, 'ST'],
  ]),
  T('JOR', [
    ['Yazid Abulaila', 71, 'GK'], ['Abdallah Al-Fakhouri', 69, 'GK'],
    ['Ihsan Haddad', 70, 'RB'], ['Anas Badawi', 68, 'RB'],
    ['Yazan Al-Arab', 72, 'CB'], ['Abdallah Nasib', 70, 'CB'], ['Mohammad Abualnadi', 69, 'CB'],
    ['Saed Al-Rosan', 68, 'CB'], ['Saleem Obaid', 68, 'LB'],
    ['Nizar Al-Rashdan', 71, 'DM'], ['Rajaei Ayed', 70, 'CM'], ['Noor Al-Rawabdeh', 71, 'CM'],
    ['Mohannad Abu Taha', 70, 'CM AM'], ['Mousa Al-Tamari', 79, 'RW AM', 7],
    ['Ali Azaizeh', 70, 'RW'], ['Mahmoud Al-Mardi', 71, 'LW', 10], ['Ibrahim Sabra', 69, 'LW'],
    ['Ali Olwan', 74, 'ST', 9], ['Odeh Al-Fakhouri', 69, 'ST'],
  ]),
  // ---- Group K ----
  T('COD', [
    ['Lionel Mpasi', 72, 'GK'], ['Timothy Fayulu', 71, 'GK'],
    ['Gédéon Kalulu', 74, 'RB'], ['Chancel Mbemba', 76, 'CB'], ['Axel Tuanzebe', 73, 'CB'],
    ['Rocky Bushiri', 72, 'CB'], ['Arthur Masuaku', 75, 'LB LM'], ['Joris Kayembe', 73, 'LB'],
    ['Noah Sadiki', 76, 'DM RB'], ['Charles Pickel', 73, 'DM'], ['Edo Kayembe', 74, 'CM'],
    ['Samuel Moutoussamy', 72, 'CM'], ['Théo Bongonda', 75, 'LW AM'],
    ['Silas Katompa', 76, 'RW LW'], ['Meschack Elia', 73, 'RW'],
    ['Yoane Wissa', 81, 'ST LW', 10], ['Cédric Bakambu', 75, 'ST'], ['Fiston Mayele', 75, 'ST'],
    ['Simon Banza', 76, 'ST', 9],
  ]),
  T('UZB', [
    ['Utkir Yusupov', 72, 'GK'], ['Abduvokhid Nematov', 71, 'GK'],
    ['Khojiakbar Alijonov', 71, 'RB'], ['Sherzod Nasrullaev', 71, 'RB LB'],
    ['Abdukodir Khusanov', 83, 'CB', 5], ['Rustamjon Ashurmatov', 73, 'CB'],
    ['Umarbek Eshmurodov', 71, 'CB'], ['Farrukh Sayfiev', 70, 'CB'],
    ['Otabek Shukurov', 73, 'DM CM'], ['Umarali Rakhmonaliev', 72, 'CM'],
    ['Jamshid Iskanderov', 71, 'CM AM'], ['Azizjon Ganiev', 71, 'CM'],
    ['Abbosbek Fayzullaev', 79, 'AM RW', 10], ['Jaloliddin Masharipov', 74, 'LW AM'],
    ['Dostonbek Khamdamov', 72, 'RW'], ['Oston Urunov', 73, 'AM RW'],
    ['Eldor Shomurodov', 78, 'ST', 9], ['Igor Sergeev', 72, 'ST'],
  ]),
  T('COL', [
    ['Camilo Vargas', 78, 'GK'], ['Álvaro Montero', 73, 'GK'],
    ['Daniel Muñoz', 82, 'RB', 17], ['Santiago Arias', 75, 'RB'],
    ['Davinson Sánchez', 81, 'CB', 23], ['Jhon Lucumí', 81, 'CB'], ['Carlos Cuesta', 75, 'CB'],
    ['Yerry Mina', 74, 'CB'], ['Johan Mojica', 76, 'LB'], ['Deiver Machado', 74, 'LB'],
    ['Jefferson Lerma', 78, 'DM CM'], ['Kevin Castaño', 76, 'CM'], ['Richard Ríos', 81, 'CM'],
    ['Juan Fernando Quintero', 76, 'AM'], ['James Rodríguez', 81, 'AM', 10, 1],
    ['Luis Díaz', 87, 'LW', 7], ['Jhon Arias', 81, 'RW AM'],
    ['Jhon Durán', 82, 'ST', 9], ['Rafael Santos Borré', 77, 'ST'], ['Jhon Córdoba', 76, 'ST'],
  ]),
  // ---- Group L ----
  T('CRO', [
    ['Dominik Livaković', 81, 'GK'], ['Dominik Kotarski', 74, 'GK'],
    ['Josip Stanišić', 81, 'RB LB', 2], ['Josip Šutalo', 78, 'CB'],
    ['Joško Gvardiol', 86, 'CB LB', 24], ['Marin Pongračić', 77, 'CB'], ['Borna Sosa', 76, 'LB'],
    ['Luka Modrić', 84, 'CM AM', 10, 1], ['Mateo Kovačić', 83, 'CM', 8],
    ['Marcelo Brozović', 80, 'DM', 11], ['Petar Sučić', 80, 'CM'],
    ['Martin Baturina', 79, 'AM'], ['Nikola Vlašić', 77, 'AM RW'], ['Lovro Majer', 78, 'AM CM'],
    ['Ivan Perišić', 76, 'LW LM', 4], ['Andrej Kramarić', 80, 'ST AM', 9],
    ['Ante Budimir', 78, 'ST'], ['Franjo Ivanović', 77, 'ST'],
  ]),
  T('GHA', [
    ['Lawrence Ati-Zigi', 74, 'GK'], ['Benjamin Asare', 72, 'GK'],
    ['Tariq Lamptey', 76, 'RB RW'], ['Alidu Seidu', 75, 'RB'],
    ['Mohammed Salisu', 77, 'CB'], ['Alexander Djiku', 76, 'CB'], ['Jerome Opoku', 73, 'CB'],
    ['Gideon Mensah', 73, 'LB'], ['Thomas Partey', 80, 'DM CM', 6],
    ['Abdul Samed Salis', 74, 'DM'], ['Elisha Owusu', 73, 'DM CM'],
    ['Mohammed Kudus', 84, 'AM RW', 10], ['Kofi Kyereh', 74, 'AM'],
    ['Ernest Nuamah', 77, 'RW LW'], ['Kamaldeen Sulemana', 76, 'LW'], ['Fatawu Issahaku', 77, 'RW'],
    ['Antoine Semenyo', 82, 'ST RW', 9], ['Iñaki Williams', 79, 'ST RW', 20],
    ['Jordan Ayew', 75, 'ST LW'],
  ]),
  T('PAN', [
    ['Orlando Mosquera', 73, 'GK'], ['Luis Mejía', 71, 'GK'],
    ['Michael Murillo', 76, 'RB', 23], ['César Blackman', 73, 'RB'],
    ['Fidel Escobar', 74, 'CB'], ['José Córdoba', 75, 'CB'], ['Edgardo Fariña', 71, 'CB'],
    ['Eric Davis', 71, 'LB'], ['Aníbal Godoy', 73, 'DM', 20],
    ['Adalberto Carrasquilla', 78, 'CM AM', 10], ['Cristian Martínez', 72, 'CM'],
    ['Carlos Harvey', 73, 'CM DM'], ['Edgar Bárcenas', 73, 'RM AM'],
    ['José Luis Rodríguez', 75, 'LW RW'], ['Ismael Díaz', 75, 'RW ST'], ['César Yanis', 72, 'LW'],
    ['Cecilio Waterman', 73, 'ST', 9], ['José Fajardo', 73, 'ST'], ['Eduardo Guerrero', 73, 'ST'],
  ]),
];

const NEW_COUNTRIES = {
  RSA: { en: 'South Africa', tr: 'Güney Afrika', flag: '🇿🇦' },
  CAN: { en: 'Canada', tr: 'Kanada', flag: '🇨🇦' },
  BIH: { en: 'Bosnia and Herzegovina', tr: 'Bosna-Hersek', flag: '🇧🇦' },
  QAT: { en: 'Qatar', tr: 'Katar', flag: '🇶🇦' },
  HAI: { en: 'Haiti', tr: 'Haiti', flag: '🇭🇹' },
  CUW: { en: 'Curaçao', tr: 'Curaçao', flag: '🇨🇼' },
  TUN: { en: 'Tunisia', tr: 'Tunus', flag: '🇹🇳' },
  IRN: { en: 'Iran', tr: 'İran', flag: '🇮🇷' },
  NZL: { en: 'New Zealand', tr: 'Yeni Zelanda', flag: '🇳🇿' },
  CPV: { en: 'Cape Verde', tr: 'Yeşil Burun Adaları', flag: '🇨🇻' },
  KSA: { en: 'Saudi Arabia', tr: 'Suudi Arabistan', flag: '🇸🇦' },
  IRQ: { en: 'Iraq', tr: 'Irak', flag: '🇮🇶' },
  NOR: { en: 'Norway', tr: 'Norveç', flag: '🇳🇴' },
  JOR: { en: 'Jordan', tr: 'Ürdün', flag: '🇯🇴' },
  COD: { en: 'DR Congo', tr: 'DR Kongo', flag: '🇨🇩' },
  UZB: { en: 'Uzbekistan', tr: 'Özbekistan', flag: '🇺🇿' },
  PAN: { en: 'Panama', tr: 'Panama', flag: '🇵🇦' },
};

// ---- merge squads.json ----
const squadsPath = 'public/data/squads.json';
const squads = JSON.parse(fs.readFileSync(squadsPath, 'utf8'));
const have = new Set(squads.map(s => `${s.sel}:${s.copa}`));
let added = 0;
for (const s of SQUADS) {
  if (have.has(`${s.sel}:2026`)) continue;
  const ids = new Set();
  for (const p of s.squad) {
    if (ids.has(p.id)) throw new Error(`dup id ${p.id} in ${s.sel}`);
    ids.add(p.id);
  }
  const nos = s.squad.map(p => p.no);
  if (new Set(nos).size !== nos.length) throw new Error(`dup shirt no in ${s.sel}`);
  squads.push(s);
  added++;
}
fs.writeFileSync(squadsPath, JSON.stringify(squads));

// ---- bands.ts (overall = avg of top 13 forces, like the originals) ----
const bandsPath = 'src/data/bands.ts';
let bands = fs.readFileSync(bandsPath, 'utf8');
const newBands = [];
for (const s of SQUADS) {
  if (bands.includes(`"sel":"${s.sel}","copa":2026`)) continue;
  const top = s.squad.map(p => p.f).sort((a, b) => b - a).slice(0, 13);
  const overall = Math.round(top.reduce((a, b) => a + b, 0) / top.length);
  newBands.push(`{"sel":"${s.sel}","copa":2026,"overall":${overall},"band":${overall + 1}}`);
}
if (newBands.length) {
  bands = bands.replace(/\];\s*$/, `,${newBands.join(',')}];\n`);
  fs.writeFileSync(bandsPath, bands);
}

// ---- countries.ts ----
const countriesPath = 'src/data/countries.ts';
let countries = fs.readFileSync(countriesPath, 'utf8');
const inserts = [];
for (const [code, c] of Object.entries(NEW_COUNTRIES)) {
  if (countries.includes(`"${code}": {`)) continue;
  inserts.push(`  "${code}": {\n    "en": ${JSON.stringify(c.en)},\n    "tr": ${JSON.stringify(c.tr)},\n    "flag": "${c.flag}"\n  }`);
}
if (inserts.length) {
  countries = countries.replace(/\n\};\s*$/, `,\n${inserts.join(',\n')}\n};\n`);
  fs.writeFileSync(countriesPath, countries);
}

console.log(`squads added: ${added} (total ${squads.length}), bands added: ${newBands.length}, countries added: ${inserts.length}`);
console.log('2026 teams now:', squads.filter(s => s.copa === 2026).map(s => s.sel).sort().join(' '));

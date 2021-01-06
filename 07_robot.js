//Este array representa las 14 carreteras que hay en el pueblo y en total consta de 11 lugares
var roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];
//La red de carreteras forma un grafo, este grafo, es el mundo por el que se moverá el robot.
//La siguiente función, transforma un array de cadenas como el de arriba en un grafo. Con esta nueva estructura de datos
//sabremos a que lugares puede llegar el robot desde un lugar determinado.
//Retorna una lista de adyacencia que representa el grafo.
function buildGraph(edges) { //edges son las aristas. Este parámetro toma como argumento el array roads
  let graph = Object.create(null);
  //A esta función se le pasa como argumentos dos strings y crea un mapa que tiene que tiene 11 claves que representan lugares origen.
  //A cada clave se le asocia un array, que contiene lugares destino, a los que se puede acceder desde un origen determinado.
  function addEdge(from, to) {
    if (graph[from] == null) {
      //Si no encuetra la clave, la crea y se le asocia con un array de un elemento, al que se le irán agregando más elementos
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  //El método map, junto con el método split para strings, crea un nuevo array, donde cada elemento es un array que contiene dos cadenas
  //cada una de las cuales representa un lugar de inicio y de fin (from, to)
  for (let [from, to] of edges.map(r => r.split("-"))) {
    //Recordar que la expresión [elemento] mapea un elemento de un array para que no sea necesario acceder a él mediante índice
    //Se llama dos veces a addEdge, ya que construimos un grafo no dirigido sin pesos en las aristas y por lo tanto representa una relación
    //binaria y simétrica entre sus vértices
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

var roadGraph = buildGraph(roads);

//VIP: que una entidad tenga la apariencia de ser susceptible de convertirse en un objeto, no significa que automáticamente
//deba convertirse en un objeto.

//Esta clase describe el estado del pueblo mediante la ubicación actual del robot (place) y la colección de paquetes 
//no entregados (parcels), cada uno de los cuales tiene una ubicación actual y una dirección destino. Calcula un nuevo 
//estado para la situación después del movimiento.
class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels; //Guarda los paquetes que tiene el robot y lo que no tiene
  }
  //El método move hace que se entregue el paquete y nos da un nuevo estado del pueblo pero deja el anterior intacto.
  move(destination) {
    //Desde dentro de la definición de una clase y sus métodos, se puede acceder a una variable externa. En este caso
    //accedemos al mapa de arrays roadGraph.

    //Esta condición verifica si hay un camino desde el lugar actual del robot, al destino, y si no es así, retorna el estado anterior
    //(o actual según se mire) ya que no es un movimiento válido
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    //Si existe un camino entre el lugar actual y el destino, crea un nuevo estado con el destino como el nuevo lugar del robot:
    //return new VillageState(destination, parcels). También crea un nuevo conjunto de paquetes: los paquetes que lleva el robot
    //(que se encuentran en el lugar actual del robot) deben trasladarse al nuevo lugar. Y los paquetes que se dirigen al nuevo
    //lugar deben entregarse i.e. deben retirarse del conjunto de paquetes no entregados. La llamada a map, se encarga de la
    //mudanza y la llamada a filter se encarga de la entrega.

    } else {
      //map, actualiza el lugar en el que se encuentran los paquetes, cuando los tiene el robot
      let parcels = this.parcels.map(p => {
        //No hace nada porque no hay ningún paquete que recoger en el lugar en el que se encuentra el robot. Este paquete
        //todavía se encuentra fuera del alcance del robot y espera ser recogido.
        if (p.place != this.place) return p;
        //Como el lugar en el que se encuentra el paquete y el lugar en el que se encuentra el robot, coinciden, el robot
        //coge el paquete, se apunta la dirección donde se tiene que entregar el paquete, y el nuevo lugar donde se encuentra el paquete,
        //que es el lugar a donde se mueve el robot: destination
        return {place: destination, address: p.address};
        //Cuando coinciden el lugar en el que se encuentra el paquete con la dirección donde se tiene que entregar el paquete
        //filter lo omite para crear el array parcels y de esta forma se entrega el paquete
      }).filter(p => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}

//La colección de paquetes no entregados (parcels) se define mediante un array de objetos. Cada objeto tiene un atributo place,
//que representa el lugar donde se encuentra el paquete, y un atributo address, que representa el lugar donde hay que entregar
//el paquete
let first = new VillageState("Post Office", [{place: "Post Office", address: "Alice's House"}]);
let next = first.move("Alice's House");
console.log(next.place);
console.log(next.parcels);

//Las estructuras de datos que no cambian se denominan inmutables o permanentes. En JS casi todo se puede cambiar, no obstante,
//existe una función llamada Object.freeze que hace que un objeto ignore la modificación de sus propiedades. De esta maneara, nos
//aseguramos de que un objeto nunca cambia e.g.

let obj = Object.freeze({value: 5});
obj.value = 10;
console.log(obj.value);

/*Cuando los objetos de un sistema son cosas fijas y estables, se puede considerar operaciones en ellos de forma aislada: mudarnos
 *a la casa de Alice desde un estado de inicio determinado siempre produce el mismo estado (nuevo) (autómata finito, grafo de estados).
 */

//Simulación: el robot tiene que decidir en qué dirección quiere moverse. Como tal, podríamos decir que un 
//robot (parámetro de la función runRobot) es una función que toma un objeto VillageState y devuelve el nombre de un lugar cercano.
//Para que el robot sea capaz de recordar cosas, para que pueda crear y ejecutar planes, también le pasamos como parámetro una
//memoria y le permitimos retornar una nueva (action.memory). Por lo tanto, el robot devuelve un objeto (action) que contiene tanto 
//la dirección en la que quiere moverse como un valor de memoria que se le devolverá la próxima vez que se llame (en el bucle, 
//robot(state, memory)).

function runRobot(state, robot, memory) {
  let turn;
  for (turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      //console.log(`Done in ${turn} turns`);
      document.write(`Done in ${turn} turns<br><br>`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    //console.log(`Moved to ${action.direction}`);
    document.write(`Moved to ${action.direction}<br>`);
  }
  return turn;
}

//Consideremos lo que tiene que hacer el robot para 'resolver' un estado determinado. Debe recoger todos los paquetes visitando todos
//los lugares que tienen un paquete y entregarlos visitando todos los lugares a los que está dirigido el paquete, pero solo después
//de recoger el paquete. Estrategia: el robot camina en un dirección aleatoria en cada desplazamiento (turn), por lo tanto, con
//gran probabilidad, eventualmente se encontrará con todos los paquetes y luego en algún momento llegará al lugar donde deben ser
//entregados.

function randomPick(array) { //Recolección aleatoria
  //La operación de abajo, retorna un número entero aleatorio entre 0 y array.length - 1, que se utilizará como índice aleatorio
  //para array.
  let choice = Math.floor(Math.random() * array.length);
  //retorna un lugar del pueblo
  return array[choice];
}

function randomRobot(state) { //El parámetro state es una instancia de la clase VillageState
  //A la función randomPick, le pasamos como argumento el array asociado a la clave state.place del mapa roadGraph.
  //state.place es por lo tanto la ubicación o lugar actual del robot y el array asociado a state.place, los posibles
  //lugares a los que puede ir.
  return {direction: randomPick(roadGraph[state.place])};
}

//Dado que al principio, el robot no puede recordar nada, se ignora el segundo argumento (arriba en robot(state, memory)) y omite
//la propiedad de memoria en su objeto devuelto (arriba en action.memory)

//Para poner el robot en funcionamiento, primero necesitamos una forma de crear un nuevo estado con una colección de paquetes
//no entregados. Un método estático (escrito aquí agreagando directamente una propiedad al constructor) es un buen lugar
//para implementar lo mencionado anteriormente.
VillageState.random = function(parcelCount = 5) { //Parámetro que toma un valor por defecto si no se llama a la función con otro argumento.
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    //Recordar que address es el lugar en el que se tiene que entregar el paquete y el segundo atributo de un objeto paquete
    let address = randomPick(Object.keys(roadGraph));
    let place;
    //Interesa ejecutar la sentencia de abajo una vez antes de empezar a iterar por que tal vez, con una vez baste para que
    //place sea diferente de address
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({place, address});
  }
  //Retorna un objeto que representa el estado del pueblo con la ubicación del robot y una colección de paquetes no entregados
  return new VillageState("Post Office", parcels);
};

//Iniciemos el mundo virtual
/*runRobot(VillageState.random(), randomRobot);*/

//Llegados a este punto del programa, nos damos cuenta de que el robot necesita muchos desplazamientos (turns) para entregar
//los paquetes. Esto ocurre porque todavía no planifica el futuro (no usa la memoria).

//A partir de aquí empiezan las mejoras del robot aleatorio. Una primera mejora es encontrar una ruta que pasa por todos los
//lugares del pueblo. El robot podría ejecutar esta ruta dos veces (¿una para recoger otra para entregar?)
//El array mailRoute, es una posibilidad (a partir de Post Office)
var mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
];

//Para implementar la ruta que sigue el robot, necesitamos hacer uso de la memoria del robot. Este, guarda el resto de la ruta
//(mailRoute) en memoria (memory) y toma la dirección (direction) del primer elemento en cada desplazamiento.
//Este robot será mucho más rápido, hará como máximo 26 desplazamientos.
function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return {direction: memory[0], memory: memory.slice(1)}; //slice(1) elimina el primer elemento del array
}

/*runRobot(VillageState.random(), routeRobot, []);*/ //Al principio la memoria está vacía ([])

//Buscador de rutas
//El robot será más eficiente, cuando se mueva deliberadamente hacia un paquete determinado o hacia el lugar donde deba
//entregarse. Hacer esto, incluso cuando el objetivo está a más de un desplazamiento de distancia, requiere una función
//de búsqueda de ruta. Podemos establecer si una solución determinada (una ruta) es una solución válida, pero no podemos
//calcular directamente la solución. En su lugar, tenemos que seguir creando posibles soluciones hasta encontrar una que
//funcione. Lo que nos interesa es la ruta más corta desde un punto A a otro punto B. Un buen enfoque sería 'hacer crecer'
//las rutas desde un punto de partida, explorando todos los lugares accesibles que aún no se han visitado, hasta que una ruta
//llegue al objetivo. De esta manera, solo exploraremos rutas que sean potencialmente interesantes y encontraremos la ruta
//más corta (o una de las rutas más cortas, si hay más de una) hacia el objetivo. La función de abajo implementa esta estrategia.
function findRoute(graph, from, to) {
  let work = [{at: from, route: []}];
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some(w => w.at == place)) { //Si ningún elemento cumple w.at == place entonces work.push
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}

let ruta = findRoute(roadGraph, "Post Office", "Grete's House");
console.log(ruta);

//La función findRoute, mantiene una lista de trabajo (work). Esta es una variedad de lugares que deberían explorarse a continuación,
//junto con la ruta (route) que nos llevó allí. Al principio, comienza solo con la posición de inicio y una ruta (route) vacía. Luego,
//la búsqueda opera tomando el siguiente elemento de work y lo explora examinando todas las carreteras que parten de ese lugar
//graph[at]. Si uno de los lugares es el objetivo (place == to) se retorna la ruta que lleva al objetivo. En caso contrario, si no
//hemos mirado este lugar antes, se agrega a work. Si lo hemos examinado antes (work.some(...) = true), dado que buscamos rutas cortas
//primero, hemos encontrado una ruta más larga a ese lugar o una exactamente tan larga como la existente, y no necesitamos explorarla
//(no se agrega a work porque no cumple la condición).

//Robot orientado a objetivos
//La función de abajo implemente la tercera versión del robot. Este robot usa la memoria como una lista de direcciones para moverse,
//al igual que el routeRobot. Cuando la lista está vacía, tiene que averiguar qué hacer a continuación. Toma el primer paquete no
//entregado del conjunto (parcel = parcels[0]) y, si ese paquete aún no se ha recogido (parcel.place != place), traza una ruta hacia
//él (findRoute(roadGraph, place, parcel.place)). Si se ha recogido el paquete (else), aún debe entregarse, por lo que el robot crea una
//ruta hacia la dirección de entrega (findRoute(roadGraph, place, parcel.address)).

//Este robot tarda una media de 16 desplazamientos para entregar 5 paquetes. Es un poco mejor que routeRobot, pero todavía no es óptimo.
function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  //En memoria se guarda la ruta a seguir. Cuando no hay una ruta a seguir o ha llegado al destino satisface la condición de
  //arriba y busca una nueva ruta
  return {direction: route[0], memory: route.slice(1)};
}

/*runRobot(VillageState.random(), goalOrientedRobot, []);*/

console.log("Measuring a robot");

const sum = (args) => {
  let result = 0;
  for (let i of args) result += i;
  return result;
}

const compareRobots = (robot1, robot2) => {
  let resultList1 = [], resultList2 = [];
  for (let i = 0; i < 20; ++i) {
    let task = VillageState.random(100);
    resultList1.push(runRobot(task, robot1, []));
    resultList2.push(runRobot(task, robot2, []));
  }
  console.log("Robot1 average: " + sum(resultList1) / resultList1.length);
  console.log("Robot2 average: " + sum(resultList2) / resultList2.length);
};

console.log("Solution: https://eloquentjavascript.net/code/#7.1");

console.log();

console.log("Robot efficiency");
//Modificar goalOrientedRobot. Empezar por el primer paquete de lista quizá no es un buen primer paso. Tal vez tendría que
//empezar por el paquete que esté más cerca. Esta misma idea se puede aplicar en cada lugar, cuando termine una entrega. Que
//vuelva a calcular cuál es el paquete más cercano desde un lugar determinado. Esto es lo que hace la función de abajo:
//parcelMoreNear
function parcelMoreNear(robotPlace, parcels) {
  let resultRoute = findRoute(roadGraph, robotPlace, parcels[0].place);
  let parcel = parcels[0];
  for (let i = 1; i < parcels.length; ++i) {
    let route = findRoute(roadGraph, robotPlace, parcels[i].place);
    if (route.length < resultRoute.length) {
      resultRoute = route;
      parcel = parcels[i];
    }
  }
  return parcel;
}

function optimalRobot({place, parcels}, route) {
  if (route.length == 0) {
    //let parcel = parcels[0];
    let parcel = parcelMoreNear(place, parcels);
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}

//Solution
function lazyRobot({place, parcels}, route) {
  if (route.length == 0) {
    // Describe a route for every parcel
    let routes = parcels.map(parcel => {
      if (parcel.place != place) {
        return {route: findRoute(roadGraph, place, parcel.place),
                pickUp: true};
      } else {
        return {route: findRoute(roadGraph, place, parcel.address),
                pickUp: false};
      }
    });

    // This determines the precedence a route gets when choosing.
    // Route length counts negatively, routes that pick up a package
    // get a small bonus.
    function score({route, pickUp}) {
      return (pickUp ? 0.5 : 0) - route.length;
    }
    route = routes.reduce((a, b) => score(a) > score(b) ? a : b).route;
  }

  return {direction: route[0], memory: route.slice(1)};
}

console.log();

console.log("Persistent group");

class PGroup {
  constructor(array) {
    this.content = array;
  }

  add(element) {
    if (this.has(element)) return this;
    return new PGroup(this.content.concat([element]));
  }

  has(element) {
    return this.content.includes(element);
  }

  delete(element) {
    if (!this.has(element)) return this;
    return new PGroup(this.content.filter(n => n != element));
  }
}

PGroup.empty = new PGroup([]);

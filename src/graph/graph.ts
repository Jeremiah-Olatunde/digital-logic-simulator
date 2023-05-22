
type Vertex = { uid: string };

export default class Graph<T extends Vertex> {
  public vertices: Map<string, T> = new Map();
  public outwardEdges: Map<string, Set<string>> = new Map();
  public inwardEdges: Map<string, Set<string>> = new Map();

  constructor(public uid: string){}

  //--- VERTEX OPERATIONS -----------------------------------------------------  
    public addVertex(vertex: T){
      vertex.uid =  `${this.uid}::${vertex.uid}`;
      if(this.vertices.has(vertex.uid)) 
        throw new Error(`Vertex(${vertex.uid}) exists`);

      this.vertices.set(vertex.uid, vertex);
      this.outwardEdges.set(vertex.uid, new Set());
      this.inwardEdges.set(vertex.uid, new Set());
    }

    public getVertex(vertexId: string): T {
      const vertex = this.vertices.get(vertexId);
      if(!vertex) throw new Error(`${vertexId} not found`);
      return vertex;
    }

    public removeVertex(vertexId: string){
      this.getVertex(vertexId);
      this.vertices.delete(vertexId);
    }

    public getAdjacentVertices(
      vertexId: string, 
      direction: "outward" | "inward"
    ): Set<string> {
      return this[`${direction}Edges`].get(vertexId)!;
    }

    public renameVertex(vertexId: string, newUid: string){
      const vertex = this.getVertex(vertexId);
      const oldUid = vertex.uid;

      vertex.uid = vertex.uid.replace(`::${vertex.uid.split("::").at(-1)}`, `::${newUid}`);

      this.vertices.set(vertex.uid, vertex);
      this.vertices.delete(oldUid);

      this.outwardEdges.forEach(v => {
        if(!v.has(oldUid)) return;
        v.add(vertex.uid);
        v.delete(oldUid);
      });

      this.outwardEdges.set(vertex.uid, this.outwardEdges.get(oldUid)!);
      this.outwardEdges.delete(oldUid);

      this.inwardEdges.forEach(v => {
        if(!v.has(oldUid)) return;
        v.add(vertex.uid);
        v.delete(oldUid);
      });

      this.inwardEdges.set(vertex.uid, this.inwardEdges.get(oldUid)!);
      this.inwardEdges.delete(oldUid);
    }

    public expand(uid: string, paths: Iterable<string>): string {
      const path = uid.split("::");
      const matches = [];

      for(const vUid of paths) {
        const fullPath = vUid.split("::");
        if(path.every(v => fullPath.includes(v))) matches.push(vUid);
      }

      if(matches.length === 0) throw new Error(`${uid} 404 not found in ${[...paths]}`);
      else if(matches.length === 1) return matches[0];
      else throw new Error(`${uid} duplicate elements`);
    }
  //---------------------------------------------------------------------------

  //--- EDGE OPERATIONS -------------------------------------------------------  
    public addEdge(init: string, term: string){
      const initV = this.getVertex(init).uid; 
      const termV = this.getVertex(term).uid;
      this.outwardEdges.get(initV)?.add(termV);
      this.inwardEdges.get(termV)?.add(initV)
    }

    public removeEdge(init: string, term: string){
      const initV = this.getVertex(init).uid; 
      const termV = this.getVertex(term).uid;
      const adjacent = this.outwardEdges.get(initV)!;
      if(!adjacent.has(termV)) throw new Error(`Edge(${initV} -> ${termV}) not found`);
      else adjacent.delete(termV);

      const inward = this.inwardEdges.get(termV)!;
      if(!inward.has(initV)) throw new Error(`Edge(${initV} -> ${termV}) not found`);
      else inward.delete(initV);
    }
  //---------------------------------------------------------------------------
  
  //--- TRAVERSAL -------------------------------------------------------------  
    public dfs(
      start: string,
      callback?: (vertex: T) => boolean | void,
    ): void {

      const stack: Set<string> = new Set();

      const descend = (v: string, depth: number) => {
        if(stack.has(v)) return;
        else stack.add(v);

        if(callback?.(this.getVertex(v))) return;
        
        for(const next of this.getAdjacentVertices(v, "outward")) 
          descend(next, ++depth);

        stack.delete(v);
      }

      descend(start, 0);
    }
  //---------------------------------------------------------------------------

  //--- MERGING ---------------------------------------------------------------
    public static merge<V extends Vertex> (
      uid: string, graphs: Graph<V>[]
    ): Graph<V> {
      const newGraph = new this<V>(uid);

      graphs.forEach(graph => {
        graph.vertices.forEach(v => newGraph.addVertex(v));
        
        for(const [init, adjacent] of graph.outwardEdges.entries())
          for(const term of adjacent.values()) 
            newGraph.addEdge(`${uid}::${init}`, `${uid}::${term}`);
      })

      return newGraph;
    }
  //---------------------------------------------------------------------------

}


      // const visited: Set<string> = new Set();
      // const stack: string[] = [start];
      // let vertex: string | undefined;

      // while(vertex = stack.pop()) {
      //   if(visited.has(vertex)) continue;
      //   else visited.add(vertex);

      //   if(callback?.(this.getVertex(vertex))) continue;
      //   stack.push(...this.getAdjacentVertices(vertex, "outward"));
      // }
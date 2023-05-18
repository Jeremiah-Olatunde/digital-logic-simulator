
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
      return this.vertices.get(this.expand(vertexId, this.vertices.keys()))!;
    }

    public removeVertex(vertexId: string){
      this.getVertex(vertexId);
      this.vertices.delete(vertexId);
    }

    public getAdjacentVertices(
      vertexId: string, 
      direction: "outward" | "inward"
    ): Set<string> {
      return this[`${direction}Edges`].get(this.expand(vertexId, this.vertices.keys()))!;
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
      this.outwardEdges.get(initV)?.add(this.expand(termV, this.vertices.keys()));
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
      const visited: string[] = [];
      const stack: string[] = [this.expand(start, this.vertices.keys())];
      let vertex: string | undefined;

      while(vertex = stack.pop()) {
        if(visited.includes(vertex)) continue;
        else visited.push(vertex);


        if(callback?.(this.getVertex(vertex))) continue;
        stack.push(...this.getAdjacentVertices(vertex, "outward"));
      }
    }
  //---------------------------------------------------------------------------

  //--- MERGING ---------------------------------------------------------------
    public static merge<V extends Vertex> (
      uid: string, graph0: Graph<V>, graph1: Graph<V>
    ): Graph<V> {
      const newGraph = new this<V>(uid);

      graph0.vertices.forEach(newGraph.addVertex.bind(newGraph));
      graph1.vertices.forEach(newGraph.addVertex.bind(newGraph));

      for(const [init, adjacent] of graph0.outwardEdges.entries())
        for(const term of adjacent.values()) 
          newGraph.addEdge(init, term);
      
      for(const [init, adjacent] of graph1.outwardEdges.entries())
        for(const term of adjacent.values()) 
          newGraph.addEdge(init, term);
      
      return newGraph;
    }
  //---------------------------------------------------------------------------

}

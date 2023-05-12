
type Vertex = { uid: string };

export default class Graph<T extends Vertex> {
  public vertices: Map<string, T> = new Map();
  public outwardEdges: Map<string, Set<string>> = new Map();
  public inwardEdges: Map<string, Set<string>> = new Map();

  constructor(public uid: string){}

  //--- VERTEX OPERATIONS -----------------------------------------------------  
    public addVertex(vertex: T){
      if(this.vertices.has(vertex.uid)) throw new Error(`Vertex(${vertex.uid}) exists`);
      this.vertices.set(vertex.uid, vertex);
      this.outwardEdges.set(vertex.uid, new Set());
      this.inwardEdges.set(vertex.uid, new Set());
    }

    public getVertex(vertexId: string): T {
      const vertex = this.vertices.get(vertexId);
      if(!vertex) throw new Error(`Vertex(${vertexId}) not found`);
      else return vertex;
    }

    public removeVertex(vertexId: string){
      this.getVertex(vertexId);
      this.vertices.delete(vertexId);
    }

     public getAdjacentVertices(vertexId: string, direction: "outward" | "inward"): Set<string> {
      this.getVertex(vertexId);
      return this[`${direction}Edges`].get(vertexId)!;
    }
  //---------------------------------------------------------------------------


  //--- EDGE OPERATIONS -------------------------------------------------------  
    public addEdge(init: string, term: string){
      this.getVertex(init); this.getVertex(term);
      this.outwardEdges.get(init)?.add(term);
      this.inwardEdges.get(term)?.add(init)
    }

    public removeEdge(init: string, term: string){
      this.getVertex(init); this.getVertex(term);
      const adjacent = this.outwardEdges.get(init)!;
      if(!adjacent.has(term)) throw new Error(`Edge(${init} -> ${term}) not found`);
      else adjacent.delete(term);

      const inward = this.inwardEdges.get(term)!;
      if(!inward.has(init)) throw new Error(`Edge(${init} -> ${term}) not found`);
      else inward.delete(init);
    }
  //---------------------------------------------------------------------------

  
  //--- TRAVERSAL -------------------------------------------------------------  
    public dfs(start: string, direction: "outward" | "inward", cbOptions: {
      preOrder?: (vertex: T, data: { visited: boolean }) => boolean | void,
      postOrder?: (vertex: T, data: { visited: boolean }) => boolean | void,
    }): void {
      const visited: Set<string> = new Set();

      function traverse(this: Graph<T>, vertexId: string){

        const vertex = this.getVertex(vertexId);
        if(cbOptions.preOrder?.(vertex, { visited: visited.has(vertexId) })) return;

        if(visited.has(vertexId)) return;
        visited.add(vertexId);

        for(const adjacentId of this.getAdjacentVertices(vertexId, direction))
          traverse.call(this, adjacentId);
        
        cbOptions.postOrder?.(vertex, { visited: visited.has(vertexId) });
      }

      traverse.call(this, start);
    }
  //---------------------------------------------------------------------------


  //--- MERGING ---------------------------------------------------------------
    public static merge<V extends Vertex> (
      uid: string, graph0: Graph<V>, graph1: Graph<V>
    ): Graph<V> {
      const newGraph = new this<V>(uid);

      for(const vertex of graph0.vertices.values())
        newGraph.addVertex(vertex);

      for(const vertex of graph1.vertices.values()) 
        newGraph.addVertex(vertex);

      for(const [init, adjacent] of graph0.outwardEdges.entries()){
        for(const term of adjacent.values()) newGraph.addEdge(init, term)
      }

      for(const [init, adjacent] of graph1.outwardEdges.entries()){
        for(const term of adjacent.values()) newGraph.addEdge(init, term)
      }
      
      return newGraph;
    }
  //---------------------------------------------------------------------------

}

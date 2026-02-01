import { Vector3 } from '@babylonjs/core';

/**
 * GridSystem - Manages game grid for placement and pathfinding
 */

export interface GridPosition {
  x: number;
  z: number;
}

export interface GridCell {
  position: GridPosition;
  worldPosition: Vector3;
  isWalkable: boolean;
  isOccupied: boolean;
  entityId?: string;
  cost: number;
}

export class GridSystem {
  private grid: Map<string, GridCell> = new Map();
  private cellSize: number = 2;
  private width: number;
  private depth: number;
  private offset: Vector3;

  constructor(width: number, depth: number, cellSize: number = 2) {
    this.width = width;
    this.depth = depth;
    this.cellSize = cellSize;
    this.offset = new Vector3(-width / 2, 0, -depth / 2);
    this.initializeGrid();
  }

  private initializeGrid(): void {
    for (let x = 0; x < this.width; x++) {
      for (let z = 0; z < this.depth; z++) {
        const key = this.getKey(x, z);
        this.grid.set(key, {
          position: { x, z },
          worldPosition: this.gridToWorld({ x, z }),
          isWalkable: true,
          isOccupied: false,
          cost: 1,
        });
      }
    }
  }

  private getKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  worldToGrid(worldPos: Vector3): GridPosition {
    const adjustedX = worldPos.x - this.offset.x;
    const adjustedZ = worldPos.z - this.offset.z;
    return {
      x: Math.floor(adjustedX / this.cellSize),
      z: Math.floor(adjustedZ / this.cellSize),
    };
  }

  gridToWorld(gridPos: GridPosition): Vector3 {
    return new Vector3(
      gridPos.x * this.cellSize + this.offset.x + this.cellSize / 2,
      0,
      gridPos.z * this.cellSize + this.offset.z + this.cellSize / 2
    );
  }

  isValidPlacement(gridPos: GridPosition): boolean {
    const cell = this.grid.get(this.getKey(gridPos.x, gridPos.z));
    return cell !== undefined && !cell.isOccupied && cell.isWalkable;
  }

  occupyCell(gridPos: GridPosition, entityId: string): boolean {
    const key = this.getKey(gridPos.x, gridPos.z);
    const cell = this.grid.get(key);
    if (cell && !cell.isOccupied) {
      cell.isOccupied = true;
      cell.isWalkable = false;
      cell.entityId = entityId;
      return true;
    }
    return false;
  }

  freeCell(gridPos: GridPosition): void {
    const key = this.getKey(gridPos.x, gridPos.z);
    const cell = this.grid.get(key);
    if (cell) {
      cell.isOccupied = false;
      cell.isWalkable = true;
      cell.entityId = undefined;
    }
  }

  getCell(gridPos: GridPosition): GridCell | undefined {
    return this.grid.get(this.getKey(gridPos.x, gridPos.z));
  }

  getEntitiesInRange(center: Vector3, radius: number): string[] {
    const centerGrid = this.worldToGrid(center);
    const radiusInCells = Math.ceil(radius / this.cellSize);
    const entities: string[] = [];

    for (let x = -radiusInCells; x <= radiusInCells; x++) {
      for (let z = -radiusInCells; z <= radiusInCells; z++) {
        const checkPos = { x: centerGrid.x + x, z: centerGrid.z + z };
        const cell = this.getCell(checkPos);
        if (cell && cell.entityId) {
          const distance = Vector3.Distance(center, cell.worldPosition);
          if (distance <= radius) {
            entities.push(cell.entityId);
          }
        }
      }
    }

    return entities;
  }

  snapToGrid(worldPos: Vector3): Vector3 {
    const gridPos = this.worldToGrid(worldPos);
    return this.gridToWorld(gridPos);
  }

  /**
   * Find path using A* algorithm
   */
  findPath(start: GridPosition, end: GridPosition): Vector3[] {
    const openSet: GridPosition[] = [start];
    const cameFrom: Map<string, GridPosition> = new Map();
    const gScore: Map<string, number> = new Map();
    const fScore: Map<string, number> = new Map();

    const key = (pos: GridPosition) => `${pos.x},${pos.z}`;

    gScore.set(key(start), 0);
    fScore.set(key(start), this.heuristic(start, end));

    while (openSet.length > 0) {
      // Get node with lowest fScore
      openSet.sort(
        (a, b) => (fScore.get(key(a)) || Infinity) - (fScore.get(key(b)) || Infinity)
      );
      const current = openSet.shift()!;

      if (current.x === end.x && current.z === end.z) {
        return this.reconstructPath(cameFrom, current);
      }

      // Check neighbors (4-directional: up, down, left, right)
      const neighbors: GridPosition[] = [
        { x: current.x + 1, z: current.z },
        { x: current.x - 1, z: current.z },
        { x: current.x, z: current.z + 1 },
        { x: current.x, z: current.z - 1 },
      ];

      for (const neighbor of neighbors) {
        const neighborKey = key(neighbor);
        const cell = this.grid.get(neighborKey);

        if (!cell || !cell.isWalkable) continue;

        const tentativeGScore = (gScore.get(key(current)) || Infinity) + 1;

        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(
            neighborKey,
            tentativeGScore + this.heuristic(neighbor, end)
          );

          if (!openSet.some((n) => n.x === neighbor.x && n.z === neighbor.z)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    // No path found - return direct line
    return [this.gridToWorld(start), this.gridToWorld(end)];
  }

  private heuristic(a: GridPosition, b: GridPosition): number {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
  }

  private reconstructPath(cameFrom: Map<string, GridPosition>, current: GridPosition): Vector3[] {
    const key = (pos: GridPosition) => `${pos.x},${pos.z}`;
    const totalPath: GridPosition[] = [current];

    while (cameFrom.has(key(current))) {
      current = cameFrom.get(key(current))!;
      totalPath.unshift(current);
    }

    return totalPath.map((pos) => this.gridToWorld(pos));
  }

  dispose(): void {
    this.grid.clear();
  }
}

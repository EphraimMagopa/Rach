export interface UndoAction {
  id: string;
  label: string;
  execute: () => void;
  undo: () => void;
}

export class UndoManager {
  private undoStack: UndoAction[] = [];
  private redoStack: UndoAction[] = [];
  private maxStackSize = 100;

  execute(action: UndoAction): void {
    action.execute();
    this.undoStack.push(action);
    this.redoStack = [];

    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
  }

  undo(): UndoAction | undefined {
    const action = this.undoStack.pop();
    if (action) {
      action.undo();
      this.redoStack.push(action);
    }
    return action;
  }

  redo(): UndoAction | undefined {
    const action = this.redoStack.pop();
    if (action) {
      action.execute();
      this.undoStack.push(action);
    }
    return action;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  get undoLabel(): string | undefined {
    return this.undoStack.at(-1)?.label;
  }

  get redoLabel(): string | undefined {
    return this.redoStack.at(-1)?.label;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}

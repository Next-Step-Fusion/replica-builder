import {
  action,
  autorun,
  computed,
  makeAutoObservable,
  makeObservable,
  observable,
  untracked,
  type IObservableArray
} from 'mobx';
import { customAlphabet } from 'nanoid';
import { Shape, type SerializedShape } from '../shapes/Shape';
import { type TokamakElement } from '../shapes/TokamakElement';
import { calculatePlasmaShape } from './plasma-shape-calc';
import { ShapeOptionsMapping } from './ShapeOptionsMapping';
import { ValidationService } from './ValidationService';

const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export type ExportedShapeData = {
  version: string;
  exportedAt: string;
  shapes: SerializedShape[];
  plasmaShape: PlasmaShape;
};

export type PlasmaShape = {
  show: boolean;
  R: number; // Big radius
  Z: number; // Vertical position
  a: number; // Small radius
  upperElongation: number;
  lowerElongation: number;
  upperTriangularity: number;
  lowerTriangularity: number;
  upperXPointSeverity: number;
  lowerXPointSeverity: number;
};

const MAX_UNDO_STACK_SIZE = 100;

//TODO: destructor
export class ShapeStore {
  disposers: (() => void)[] = [];
  shapes: IObservableArray<Shape> = [] as any;
  undoStack: string[] = [];
  undoStackCursor = -1;
  interacting = false;
  validationService: ValidationService;
  plasmaShape: PlasmaShape = {
    show: false,
    R: 250,
    Z: 250,
    a: 100,
    upperElongation: 1.2,
    lowerElongation: 1.3,
    upperTriangularity: 0.2,
    lowerTriangularity: 0.5,
    upperXPointSeverity: 1.0,
    lowerXPointSeverity: 1.0
  };
  // for the duration of form editing
  pausePlasmaShapeCalculation = false;
  lastExportableStateChange = Date.now();

  backgroundImage = makeAutoObservable({
    opacity: 0.5,
    imageFile: null as File | null,
    get imageUrl() {
      return this.imageFile ? URL.createObjectURL(this.imageFile) : null;
    },
    center: { x: 300, y: 300 },
    width: 500
    //height: null as number | null,
    //scale: 1
  });

  get plasmaShapePath() {
    if (!this.plasmaShape?.show) return null;
    const [r, z] = calculatePlasmaShape(
      this.plasmaShape.R,
      this.plasmaShape.Z,
      this.plasmaShape.a,
      this.plasmaShape.upperElongation,
      this.plasmaShape.lowerElongation,
      this.plasmaShape.upperTriangularity,
      this.plasmaShape.lowerTriangularity,
      this.plasmaShape.upperXPointSeverity,
      this.plasmaShape.lowerXPointSeverity
    );
    if (r?.length === 0 || z?.length === 0) return '';

    let pathData = `M ${r[0]!.toFixed(3)},${-z[0]!.toFixed(3)}`;
    if (r.length === 1) return pathData;

    for (let i = 1; i < r.length; ) {
      pathData += ` L ${r[i]!.toFixed(3)},${-z[i]!.toFixed(3)}`;
      i += 1;
    }
    this.lastExportableStateChange = Date.now();
    return pathData;
  }

  constructor() {
    makeObservable(this, {
      shapes: observable.shallow,
      unfinishedShape: computed,
      undo: action,
      redo: action,
      interacting: observable,
      plasmaShape: observable,
      pausePlasmaShapeCalculation: observable,
      plasmaShapePath: computed
    });
    this.validationService = new ValidationService(this);
    this.disposers.push(() => this.validationService.dispose());

    const interactingOnHandler = () => {
      this.interacting = true;
    };
    this.disposers.push(() => {
      document.removeEventListener('mousedown', interactingOnHandler);
      document.removeEventListener('touchstart', interactingOnHandler);
      document.removeEventListener('pointerdown', interactingOnHandler);
    });
    // Set up interaction detection
    ['mousedown', 'touchstart', 'pointerdown'].forEach((event) => {
      document.addEventListener(event, interactingOnHandler);
    });

    const interactingOffHandler = () => {
      this.interacting = false;
    };
    this.disposers.push(() => {
      document.removeEventListener('mouseup', interactingOffHandler);
      document.removeEventListener('touchend', interactingOffHandler);
      document.removeEventListener('pointerup', interactingOffHandler);
      document.removeEventListener('mouseleave', interactingOffHandler);
    });
    ['mouseup', 'touchend', 'pointerup', 'mouseleave'].forEach((event) => {
      document.addEventListener(event, interactingOffHandler);
    });

    try {
      const savedState = localStorage.getItem('replica-builder-state');
      if (savedState) {
        const ret = JSON.parse(savedState);
        this.import(ret);
      }
    } catch (e) {
      console.error('Error loading saved state', e);
    }

    let lastSaved = this.lastExportableStateChange;
    const autosave = setInterval(() => {
      if (this.lastExportableStateChange > lastSaved) {
        lastSaved = this.lastExportableStateChange;
        const ret = this.export();
        localStorage.setItem('replica-builder-state', JSON.stringify(ret));
      }
    }, 3000);
    this.disposers.push(() => clearInterval(autosave));
    // disable selection when a new shape is being built
    this.disposers.push(
      autorun(() => {
        if (this.unfinishedShape) {
          this.disableSelection();
        } else {
          this.enableSelection();
        }
      })
    );

    this.disposers.push(
      autorun(
        () => {
          if (this.unfinishedShape || this.interacting) return;
          const ex = this.export().shapes;
          const serialized = JSON.stringify(ex);

          // Don't save if state hasn't changed
          if (this.undoStack[this.undoStackCursor] === serialized) return;
          this.lastExportableStateChange = Date.now();

          // Clear any redo history when new changes are made
          this.undoStack = this.undoStack.slice(0, this.undoStackCursor + 1);

          // Add new state to stack
          this.undoStack.push(serialized);
          this.undoStackCursor++;

          console.log(
            'added to undo stack, stack size and cursor',
            this.undoStack.length,
            this.undoStackCursor
          );

          // Maintain stack size limit
          if (this.undoStack.length > MAX_UNDO_STACK_SIZE) {
            this.undoStack.shift();
            this.undoStackCursor--;
          }
        },
        {
          delay: 500,
          name: 'add to undo stack'
        }
      )
    );
  }

  dispose() {
    this.disposers.forEach((d) => d());
    this.disposers = [];
  }

  undo() {
    if (!this.canUndo()) return;
    console.log('undoing');
    this.undoStackCursor--;
    const ex = this.undoStack[this.undoStackCursor]!; // Safe due to bounds check
    this.shapes.clear();
    this.deserialize(JSON.parse(ex));
  }

  redo() {
    untracked(() => {
      if (!this.canRedo()) return;
      console.log('redoing');
      this.undoStackCursor++;
      const ex = this.undoStack[this.undoStackCursor]!; // Safe due to bounds check
      this.shapes.clear();
      this.deserialize(JSON.parse(ex));
    });
  }

  canUndo() {
    return this.undoStackCursor > 0;
  }

  canRedo() {
    return this.undoStackCursor < this.undoStack.length - 1;
  }

  get unfinishedShape() {
    return this.shapes.find((s) => s.isBuilding);
  }

  get selectedShapes() {
    return this.shapes.filter((s) => s.isSelected);
  }

  disableSelection = () => {
    this.shapes.forEach((s) => (s.disableSelection = true));
  };

  enableSelection = () => {
    this.shapes.forEach((s) => (s.disableSelection = false));
  };

  deselectAll = () => {
    this.shapes.forEach((s) => !s.isBuilding && s.deselect());
  };

  deleteShape = (id: string) => {
    const item = this.shapes.find((s) => s.id === id);
    if (item) {
      this.shapes.remove(item);
    }
  };

  deleteUnfinishedShapes(type?: TokamakElement) {
    const unfinished = this.shapes.filter((s) => s.isBuilding && (!type || s.element === type));
    unfinished.forEach((s) => this.deleteShape(s.id));
    return unfinished.length > 0;
  }

  private validateLimit(type: TokamakElement, includeUnfinished = true) {
    let filtered = this.shapes.filter((s) => s.element === type);
    if (!includeUnfinished) {
      filtered = filtered.filter((s) => !s.isBuilding);
    }
    const count = filtered.length;
    switch (type) {
      case 'limiter':
        return count < 1;
    }
    return true;
  }

  get canCreateLimiter() {
    return this.validateLimit('limiter', false);
  }

  get canCreateVessel() {
    return this.validateLimit('vessel', false);
  }

  get canCreateCoil() {
    return this.validateLimit('coil', false);
  }

  get canCreatePassive() {
    return this.validateLimit('passive', false);
  }

  get canCreateProbe() {
    return this.validateLimit('probe', false);
  }

  get canCreateLoop() {
    return this.validateLimit('loop', false);
  }

  get canCreateTFCoil() {
    return this.validateLimit('tf_coil', false);
  }

  get canCreateBlanket() {
    return this.validateLimit('blanket', false);
  }
  private getSafeShapeId() {
    let id = nanoid();
    while (this.shapes.find((s) => s.id === id)) {
      id = nanoid();
    }
    return id;
  }

  private toggleCreateShape(type: TokamakElement) {
    // a case where we cancel the creation of a shape on repeated click
    if (this.deleteUnfinishedShapes(type)) {
      return null;
    }
    // a case where we cancel the creation of a shape when a different shape is being created
    this.deleteUnfinishedShapes();
    if (!this.validateLimit(type)) {
      return null;
    }

    const shape = new Shape(this.getSafeShapeId(), ShapeOptionsMapping[type], this);
    this.shapes.push(shape);
    return shape;
  }

  deserialize(data: SerializedShape[]) {
    return data.map((s) => {
      const shape = new Shape(this.getSafeShapeId(), ShapeOptionsMapping[s.element], this);
      s.points.forEach((p) =>
        shape.addPoint({ x: p.x, y: -p.y }, undefined, p.isCurveControl, true)
      );
      shape.metadata = s.metadata;
      shape.beforeStopBuilding();
      shape.stopBuilding();
      shape.deselect();
      this.shapes.push(shape);
      return shape;
    });
  }

  export(): ExportedShapeData {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      shapes: this.shapes.map((s) => s.serialize()),
      plasmaShape: JSON.parse(JSON.stringify(this.plasmaShape))
    };
  }

  import(data: ExportedShapeData) {
    this.shapes.clear();
    this.undoStackCursor = -1;
    this.undoStack = [];
    this.deserialize(data.shapes);
    this.plasmaShape = data.plasmaShape;
  }

  toggleCreateVessel = () => {
    return this.toggleCreateShape('vessel');
  };

  toggleCreateLimiter = () => {
    return this.toggleCreateShape('limiter');
  };

  toggleCreateCoil = () => {
    return this.toggleCreateShape('coil');
  };

  toggleCreatePassive = () => {
    return this.toggleCreateShape('passive');
  };

  toggleCreateProbe = () => {
    return this.toggleCreateShape('probe');
  };

  toggleCreateLoop = () => {
    return this.toggleCreateShape('loop');
  };

  toggleCreateTFCoil = () => {
    return this.toggleCreateShape('tf_coil');
  };

  toggleCreateBlanket = () => {
    return this.toggleCreateShape('blanket');
  };
}

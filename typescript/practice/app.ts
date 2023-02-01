import { Validator } from './app/utils/validation';

interface Draggable {
    dragStartHandler(event: DragEvent) : void;
    dragEndHandler(event: DragEvent) : void;
}

interface DropTarget {
    dragOverHandler(event: DragEvent) : void;
    dropHandler(event: DragEvent) : void;
    dragLeaveHandler(event: DragEvent) : void;
}

interface AppState {
    projects: Project[]
}

type ProjectListener = (projects: Project[]) => void;

class App {
    private static instance: App;

    static getApp() {
        if (!this.instance) {
            this.instance = new App();
        }
        return this.instance;
    }

    private state: AppState;
    private listeners: ProjectListener[];

    private _activeProjects?: ProjectList;
    private _finishedProjects?: ProjectList;
    private _projectForm?: ProjectInput;

    private constructor() {
        this.state = {
            projects: []
        };
        this.listeners = [];
    }

    init() {
        this._projectForm = new ProjectInput();
        this._activeProjects = new ProjectList('active');
        this._finishedProjects = new ProjectList('finished');
    }

    addProject(project: Project) {
        this.state.projects.push(project);
        this.notifyListeners();
    }

    toggleProjectStatus(pId: number, status: 'active' | 'finished') {
        const project = this.state.projects.find(p => p.id === pId);
        if (project && project.status !== status) {
            project.status = status;
            this.notifyListeners();
        }
    }

    removeProject(id: number) {
        const i = this.state.projects.findIndex(p => p.id === id);
        this.state.projects.splice(i, 1);
        this.notifyListeners();
    }

    registerListener(f: ProjectListener) {
        this.listeners.push(f);
    }

    notifyListeners() {
        for (const listener of this.listeners) {
            listener([...this.state.projects]);
        }
    }
}
const app = App.getApp();

abstract class HTMLBasedClass<T extends HTMLElement, U extends HTMLElement> {
    template: HTMLTemplateElement;
    hostElement: U;
    element: T

    constructor(templateId: string, hostId: string) {
        this.template = document.getElementById(templateId) as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostId) as U;
        this.element = document.importNode(this.template.content.firstElementChild as T, true);
    }

    abstract attach(): void
}

class ProjectItem extends HTMLBasedClass<HTMLLIElement, HTMLUListElement> implements Draggable {
    project: Project;
    constructor(hostId: string, project: Project) {
        super('single-project', hostId);
        this.project = project;
        this.attach();
    }

    attach(): void {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = `People working on it: ${this.project.people}`;
        this.element.querySelector('p')!.textContent = this.project.description;

        this.hostElement.appendChild(this.element);

        this.element.addEventListener('dragstart', (event) => this.dragStartHandler(event));
        this.element.addEventListener('dragend', (event) => this.dragEndHandler(event));
    }

    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData('text/plain', this.project.id.toString());
        event.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(event: DragEvent) {

    }
}

class ProjectList extends HTMLBasedClass<HTMLElement, HTMLDivElement> implements DropTarget {
    projects: Project[] = [];
    type: 'active' | 'finished';

    constructor(type: 'active' | 'finished') {
        super('project-list', 'app');
        this.type = type;
        this.attach();

        this.element.addEventListener('dragover', (event) => this.dragOverHandler(event));
        this.element.addEventListener('drop', (e) => this.dropHandler(e));
        this.element.addEventListener('dragleave', (e) => this.dragLeaveHandler(e));

        app.registerListener((projects: Project[]) => {
            this.element.querySelector('ul')!.innerHTML = '';
            projects.filter(p => p.status === this.type).forEach(p => new ProjectItem(`${this.type}-projects-list`, p));
        });
    }

    attach() {
        this.element.id = `${this.type}-projects`;
        this.element.querySelector('h2')!.textContent = this.type[0].toUpperCase() + this.type.slice(1) + ' projects';
        this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
        this.hostElement.appendChild(this.element);
    }

    addProject(project: Project) {
        this.projects.push(project);
        const projectEl = document.createElement('li');
        projectEl.textContent = project.title;
        this.element.querySelector('ul')!.appendChild(projectEl);
    }

    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            this.element.querySelector('ul')!.classList.add('droppable');
        }
    }

    dropHandler(event: DragEvent) {
        const pId = event.dataTransfer!.getData('text/plain');
        app.toggleProjectStatus(+pId, this.type);
    }

    dragLeaveHandler(event: DragEvent) {
        this.element.querySelector('ul')!.classList.remove('droppable');
    }
}

class ProjectInput extends HTMLBasedClass<HTMLFormElement, HTMLDivElement> {
    @Validator.NotEmpty
    title: HTMLInputElement;
    @Validator.NotEmpty
    @Validator.MaxLength(1000)
    description: HTMLInputElement;
    @Validator.Positive
    @Validator.MaxNumber(12)
    people: HTMLInputElement;

    constructor() {
        super('project-input', 'app');
        this.attach();

        this.title = this.element.querySelector('#title') as HTMLInputElement;
        this.description = this.element.querySelector('#description') as HTMLInputElement;
        this.people = this.element.querySelector('#people') as HTMLInputElement;
    }

    attach() {
        this.element.id = 'user-input';
        this.element.addEventListener('submit', (event) => this.submitForm(event));
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }

    submitForm(event: SubmitEvent) {
        event.preventDefault();

        if (! Validator.getValidator().validate(this)) {
            alert('Invalid form data');
            return;
        }

        app.addProject(new Project(this.title.value, this.description.value, +this.people.value));
        this.element.reset();
    }
}

class Project {
    private static currentId = 0;

    public status: 'active' | 'finished';
    public readonly id: number;

    constructor(public title: string, public description: string, public people: number) {
        this.status = 'active';
        this.id = ++Project.currentId;
    }
}

app.init();
import { NavRoute } from './nav-route';
import { INavClasses } from './resources/nav';
import { IRouter, NavigationInstruction } from './router';
export interface INavRoute {
    route?: NavigationInstruction | NavigationInstruction[];
    execute?: ((route: NavRoute) => void);
    condition?: boolean | ((route: NavRoute) => boolean);
    consideredActive?: NavigationInstruction | NavigationInstruction[] | ((route: NavRoute) => boolean);
    compareParameters?: boolean;
    link?: string;
    title: string;
    children?: INavRoute[];
    meta?: Record<string, unknown>;
}
export declare class Nav {
    name: string;
    routes: NavRoute[];
    classes: INavClasses;
    router: IRouter;
    constructor(router: IRouter, name: string, routes?: NavRoute[], classes?: INavClasses);
    addRoutes(routes: INavRoute[]): void;
    update(): void;
    private addRoute;
    private updateRoutes;
}
//# sourceMappingURL=nav.d.ts.map
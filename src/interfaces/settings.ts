import {ViewMode} from '../enums/view-mode';

import {InteractionOptions} from "../enums/interaction-options";

export interface Settings {
    darkMode: boolean;
    viewMode: ViewMode;
    interactionSettings: InteractionOptions
}

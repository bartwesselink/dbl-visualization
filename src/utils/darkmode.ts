export class DarkMode {
    /** @author Mathijs Boezer */

    public set(enabled: boolean): void {
        if(!document.querySelector(".mdl-layout__container")) {
            return;
        } // container does not (yet) exist
        if(enabled) {
            document.querySelector(".mdl-layout__container").classList.add("dark-mode");
        } else {
            document.querySelector(".mdl-layout__container").classList.remove("dark-mode");
        }
    }
    /** @end-author Mathijs Boezer */
}

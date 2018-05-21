export class DarkMode {
    /** @author Mathijs Boezer */
    public set(enabled: boolean): void {
        if(!document.querySelector("body")) {
            return;
        }
        if(enabled) {
            document.querySelector("body").classList.add("dark-mode");
        } else {
            document.querySelector("body").classList.remove("dark-mode");
        }
    }
    /** @end-author Mathijs Boezer */
}

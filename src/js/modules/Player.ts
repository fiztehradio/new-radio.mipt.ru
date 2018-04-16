export class Player {
    private readonly element: JQuery;
    private keypressed = false;
    
    constructor() {
        this.element = $(`#player`);
        this.init();
    }

    private init(): void {
        const volume = $('.volume-control');
        volume.on('mousedown', () => this.keypressed = true);
        volume.on('mousedown', () => console.log('down'));
        volume.on('mouseup', () => this.keypressed = false);
        $(document).on('mousemove', e => {
            if (!this.keypressed) {
                return;
            }

            console.log(e);
        })
    }
}
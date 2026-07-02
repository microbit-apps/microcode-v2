namespace microcode {
    const GALLERY_SCOPE = "samples/gallery"
    const GALLERY_BACKGROUND_COLOR = 0xc
    const GALLERY_COLUMN_COUNT = 4
    const GALLERY_CONTROL_SIZE = 32
    const GALLERY_CONTROL_GAP = 6
    const GALLERY_LEFT = 8
    const GALLERY_TOP = 5

    /**
     * Screen that lets the user choose a sample program and open it in the editor.
     */
    export class SamplesGalleryScreen extends ui.UiScreen {
        private host_: AppHost

        constructor(host: AppHost) {
            super(host.runtime)
            this.backgroundColor = GALLERY_BACKGROUND_COLOR
            this.host_ = host
            const controls = samples(true).map((sample, index) => {
                return {
                    id: "sample-" + index,
                    value: sample,
                    bitmapId: sample.icon,
                    onActivate: (value: Sample) => this.openSample(value),
                }
            })

            const galleryGrid = new ControlGrid<Sample>({
                scopeId: GALLERY_SCOPE,
                controls: controls,
                columnCount: GALLERY_COLUMN_COUNT,
                controlWidth: GALLERY_CONTROL_SIZE,
                controlHeight: GALLERY_CONTROL_SIZE,
                rowGap: GALLERY_CONTROL_GAP,
                columnGap: GALLERY_CONTROL_GAP,
                controlStyle: AppStyles.iconButton(),
            })

            this.add(galleryGrid, {
                x: GALLERY_LEFT,
                y: GALLERY_TOP,
            })
        }

        public handleInput(event: ui.UiInputEvent): boolean | undefined {
            if (event.action == "cancel") {
                if (event.phase != "released") this.host_.pop()
                return true
            }
            return undefined
        }

        private openSample(sample: Sample): void {
            replaceAutoProgram(sample.source)
            this.host_.launchEditor()
        }
    }
}

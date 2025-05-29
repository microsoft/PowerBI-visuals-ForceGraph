import powerbi from "powerbi-visuals-api";
import VisualEventType = powerbi.VisualEventType;
import ITelemetryService = powerbi.extensibility.ITelemetryService;

export class ExternalLinksTelemetry {
    private telemetry: ITelemetryService;
    private isTraced: boolean = false;

    constructor(telemetry: ITelemetryService) {
        this.telemetry = telemetry;
    }

    private traceDetected() {
        if (this.isTraced) {
            return;
        }
        this.telemetry.trace(VisualEventType.Trace, "External image link detected");
        this.isTraced = true;
    }

    public detectExternalImages(url: string): void {
        const hasExternalImageLink: boolean = ExternalLinksTelemetry.containsExternalURL(url);

        if (hasExternalImageLink) {
            this.traceDetected();
        }
    }

    public static containsExternalURL(url: string): boolean {
        return /^(ftp|https|http):\/\/[^ "]+$/.test(url);
    }
}
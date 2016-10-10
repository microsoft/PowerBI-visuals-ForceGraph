module powerbi.extensibility.visual {
    export class ForceGraphSettings extends SettingsParser {
        public labels: LabelsSettings = new LabelsSettings();
        public links: LinksSettings = new LinksSettings();
        public nodes: NodesSettings = new NodesSettings();
        public size: SizeSettings = new SizeSettings();
    }

    export class LabelsSettings {
        public show: boolean = true;
        public fillColor: string = "#777777";
        public fontSize: number = 9;
    }

    export class LinksSettings {
        public showArrow: boolean = false;
        public showLabel: boolean = false;
        public colorLink: LinkColorType = LinkColorType.Interactive;
        public thickenLink: boolean = true;
        public displayUnits: number = 0;
        public decimalPlaces: number = null;
    }

    export enum LinkColorType {
        ByWeight = <any>"By Weight",
        ByLinkType = <any>"By Link Type",
        Interactive = <any>"Interactive"
    }

    export class NodesSettings {
        public displayImage: boolean = false;
        public defaultImage: string = "Home";
        public imageUrl: string = "";
        public imageExt: string = ".png";
        public nameMaxLength: number = 10;
        public highlightReachableLinks: boolean = false;
    }

    export class SizeSettings {
        public charge: number = -15;
    }
}

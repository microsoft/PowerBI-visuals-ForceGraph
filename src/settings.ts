/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsCompositeCard = formattingSettings.CompositeCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
import FormattingSettingsGroup = formattingSettings.Group;

import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import IEnumMember = powerbi.IEnumMember;

export class ForceGraphSettings extends FormattingSettingsModel {
    public animation: AnimationSettings = new AnimationSettings();
    public labels: LabelsSettings = new LabelsSettings();
    public links: LinksSettings = new LinksSettings();
    public nodes: NodesSettings = new NodesSettings();
    public size: SizeSettings = new SizeSettings();

    public cards: Array<FormattingSettingsCard> = [this.animation, this.labels, this.links, this.nodes, this.size];

    public setHighContrastColor(colorPalette: ISandboxExtendedColorPalette): void {
        if (colorPalette.isHighContrast){
            this.labels.color.value = colorPalette.foreground;
            this.links.linkLabels.color.value = colorPalette.foreground;
            this.nodes.optionGroup.fillColor.value = colorPalette.foreground;
            this.nodes.optionGroup.strokeColor.value = colorPalette.background;   
        }
    }

    public setLocalizedOptions(localizationManager: ILocalizationManager): void{
        this.setLocalizedDisplayName(colorLinkOptions, localizationManager);
    }

    private setLocalizedDisplayName(options: IEnumMemberWithDisplayNameKey[], localizationManager: ILocalizationManager): void{
        options.forEach(option => {
            option.displayName = localizationManager.getDisplayName(option.key);
        });
    }
}

class AnimationSettings extends FormattingSettingsCard {
    public show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Show",
        value: true
    });

    public name: string = "animation";
    public displayNameKey: string = "Visual_Animations";
    topLevelSlice: formattingSettings.ToggleSwitch = this.show;
}

class BaseFontCardSettings extends formattingSettings.FontControl {
    public static minFontSize: number = 8;
    public static maxFontSize: number = 60;
    constructor(defaultFontSize: number, defaultFontFamily: string){
        super(
            new formattingSettings.FontControl({
                name: "font",
                displayName: "Font",
                displayNameKey: "Visual_Font",
                fontFamily: new formattingSettings.FontPicker({
                    name: "fontFamily",
                    value: defaultFontFamily
                }),
                fontSize: new formattingSettings.NumUpDown({
                    name: "fontSize",
                    displayName: "Text Size",
                    displayNameKey: "Visual_TextSize",
                    value: defaultFontSize,
                    options: {
                        minValue: {
                            type: powerbi.visuals.ValidatorType.Min,
                            value: 8
                        },
                        maxValue: {
                            type: powerbi.visuals.ValidatorType.Max,
                            value: 60
                        }
                    }
                }),
                bold: new formattingSettings.ToggleSwitch({
                    name: "fontBold",
                    value: false
                }),
                italic: new formattingSettings.ToggleSwitch({
                    name: "fontItalic",
                    value: false
                }),
                underline: new formattingSettings.ToggleSwitch({
                    name: "fontUnderline",
                    value: false
                })
            })
        );
    }
}

class LabelsSettings extends FormattingSettingsCard {
    public defaultLabelColor: string = "#777777";
    public defaultFontFamily: string = "Segoe UI, sans-serif";
    public defaultFontSize: number = 9;

    public fontControl = new BaseFontCardSettings(this.defaultFontSize, this.defaultFontFamily);

    public show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Show",
        value: true
    });

    public color = new formattingSettings.ColorPicker({
        name: "color",
        displayNameKey: "Visual_Color",
        value: { value: this.defaultLabelColor }
    });

    public allowIntersection = new formattingSettings.ToggleSwitch({
        name: "allowIntersection",
        displayNameKey: "Visual_Intersection",
        value: false
    });

    public name: string = "labels";
    public displayNameKey: string = "Visual_DataLabels";
    topLevelSlice: formattingSettings.ToggleSwitch = this.show;
    slices: FormattingSettingsSlice[] = [this.fontControl, this.color, this.allowIntersection];
}

interface IEnumMemberWithDisplayNameKey extends IEnumMember{
    key: string;
}

export enum LinkColorType {
    ByWeight = "By Weight",
    ByLinkType = "By Link Type",
    Interactive = "Interactive"
}

const colorLinkOptions : IEnumMemberWithDisplayNameKey[] = [
    {value : LinkColorType.ByWeight, displayName : "By Weight", key: "Visual_ForceGraph_ByWeight"}, 
    {value : LinkColorType.ByLinkType, displayName : "By Link Type", key: "Visual_ForceGraph_ByLinkType"},
    {value : LinkColorType.Interactive, displayName : "Interactive", key: "Visual_Interactive"}, 
];

class LinkOptionsGroup extends FormattingSettingsCard {
    public showArrow = new formattingSettings.ToggleSwitch({
        name: "showArrow",
        displayNameKey: "Visual_Arrow",
        value: false
    });

    public thickenLink = new formattingSettings.ToggleSwitch({
        name: "thickenLink",
        displayNameKey: "Visual_ForceGraph_Thickness",
        descriptionKey: "Visual_Description_Thickness",
        value: true
    });

    public displayUnits = new formattingSettings.AutoDropdown({
        name: "displayUnits",
        displayNameKey: "Visual_DisplayUnits",
        value: 0,
    });

    public decimalPlaces = new formattingSettings.NumUpDown({
        name: "decimalPlaces",
        displayNameKey: "Visual_ForceGraph_DecimalPlaces",
        value: null,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 0
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 5
            },
        }
    });

    public colorLink = new formattingSettings.ItemDropdown({
        name: "colorLink",
        displayNameKey: "Visual_Color",
        items: colorLinkOptions,
        value: colorLinkOptions[2],
    });

    public name: string = "linkOptions";
    public displayNameKey: string = "Visual_Options";
    slices: FormattingSettingsSlice[] = [this.showArrow, this.thickenLink, this.colorLink, this.displayUnits, this.decimalPlaces]
}

class LinkLabelsGroup extends FormattingSettingsCard {
    public defaultFontSize: number = 10;
    public defaultFontFamily: string = "Segoe UI, sans-serif";
    public defaultLabelColor: string = "black";

    public showLabel = new formattingSettings.ToggleSwitch({
        name: "showLabel",
        displayNameKey: "Visual_Label",
        descriptionKey: "Visual_Description_Label",
        value: false
    });

    public color = new formattingSettings.ColorPicker({
        name: "color",
        displayNameKey: "Visual_Color",
        value: { value: this.defaultLabelColor }
    });

    public fontControl = new BaseFontCardSettings(this.defaultFontSize, this.defaultFontFamily);
    
    topLevelSlice: formattingSettings.ToggleSwitch = this.showLabel;
    public name: string = "linkLabels";
    public displayNameKey: string = "Visual_Label";
    slices: FormattingSettingsSlice[] = [this.fontControl, this.color]
}

class LinksSettings extends FormattingSettingsCompositeCard {
    public linkOptions: LinkOptionsGroup = new LinkOptionsGroup();
    public linkLabels: LinkLabelsGroup = new LinkLabelsGroup();

    public name: string = "links";
    public displayNameKey: string = "Visual_ForceGraph_Links";
    groups: FormattingSettingsGroup[] = [this.linkOptions, this.linkLabels];
}

class NodeImageSettingsGroup extends FormattingSettingsCard {
    public defaultImageUrlPlaceholder: string = "Url";
    public defaultImageValuePlaceholder: string = "Image name";
    public defaultImageExt: string = ".png";

    public displayImage = new formattingSettings.ToggleSwitch({
        name: "displayImage",
        displayNameKey: "Visual_Image",
        value: false
    });

    public imageUrl = new formattingSettings.TextInput({
        name: "imageUrl",
        displayNameKey: "Visual_ImageUrl",
        value: "",
        placeholder: this.defaultImageUrlPlaceholder
    });

    public defaultImage = new formattingSettings.TextInput({
        name: "defaultImage",
        displayNameKey: "Visual_DefaultImage",
        value: "",
        placeholder: this.defaultImageValuePlaceholder
    });

    public imageExt = new formattingSettings.TextInput({
        name: "imageExt",
        displayNameKey: "Visual_ImageExtension",
        value: this.defaultImageExt,
        placeholder: this.defaultImageExt
    });
    
    topLevelSlice: formattingSettings.ToggleSwitch = this.displayImage;
    public name: string = "displayImageGroup";
    public displayNameKey: string = "Visual_Image";
    public slices: FormattingSettingsSlice[] = [this.imageUrl, this.defaultImage, this.imageExt];
}

class NodeOptionsGroup extends FormattingSettingsCard {
    public defaultNameMaxLength: number = 10;
    public defaultFillColor: string = "#cccccc";
    public defaultStrokeColor: string = "#777777";

    public nameMaxLength = new formattingSettings.NumUpDown({
        name: "nameMaxLength",
        displayNameKey: "Visual_ForceGraph_MaxNameLength",
        value: this.defaultNameMaxLength
    });

    public highlightReachableLinks = new formattingSettings.ToggleSwitch({
        name: "highlightReachableLinks",
        displayNameKey: "Visual_ForceGraph_HighlightLinks",
        value: false
    });

    public fillColor = new formattingSettings.ColorPicker({
        name: "color",
        displayNameKey: "Visual_Fill",
        value: { value: this.defaultFillColor }
    });

    public strokeColor = new formattingSettings.ColorPicker({
        name: "strokeColor",
        displayNameKey: "Visual_Stroke",
        value: { value: this.defaultStrokeColor }
    });

    public name: string = "nodeOptions";
    public displayNameKey: string = "Visual_Options";
    public slices: FormattingSettingsSlice[] = [this.fillColor, this.strokeColor, this.nameMaxLength, this.highlightReachableLinks];
}

class NodesSettings extends FormattingSettingsCompositeCard {
    public imageGroup: NodeImageSettingsGroup = new NodeImageSettingsGroup();
    public optionGroup: NodeOptionsGroup = new NodeOptionsGroup();
   
    public name: string = "nodes";
    public displayNameKey: string = "Visual_Nodes";
    groups: FormattingSettingsGroup[] = [this.optionGroup, this.imageGroup];
}

class SizeSettings extends FormattingSettingsCard{
    public defaultCharge: number = -15;

    public charge = new formattingSettings.NumUpDown({
        name: "charge",
        displayNameKey: "Visual_Charge",
        value: this.defaultCharge,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: -100
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: -0.1
            }
        }
    });

    public boundedByBox = new formattingSettings.ToggleSwitch({
        name: "boundedByBox",
        displayNameKey: "Visual_BoundByBox",
        value: false
    });
    public name: string = "size";
    public displayNameKey: string = "Visual_Size";
    slices: FormattingSettingsSlice[] = [this.charge, this.boundedByBox];
}
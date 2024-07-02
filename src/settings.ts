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
            //add nodes fill and nodes stroke
            // settings.nodes.fill = colorHelper.getHighContrastColor(
            //     "foreground",
            //     settings.nodes.fill
            // );
    
            // settings.nodes.stroke = colorHelper.getHighContrastColor(
            //     "background",
            //     settings.nodes.stroke
            // );
        }
    }
}

class AnimationSettings extends FormattingSettingsCard {
    public show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Show",
        value: true //change false
    });

    public name: string = "animation";
    public displayNameKey: string = "Visual_Animations";
    topLevelSlice: formattingSettings.ToggleSwitch = this.show;
}

class LabelsSettings extends FormattingSettingsCard {
    public defaultLabelColor: string = "#777777";
    public defaultFontSize: number = 9;

    public show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Show",
        value: true
    });

    public color = new formattingSettings.ColorPicker({
        name: "color",
        displayNameKey: "Visual_Fill",
        value: { value: this.defaultLabelColor }
    });

    public fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayNameKey: "Visual_TextSize",
        value: this.defaultFontSize,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 8
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 60
            },
        }
    });

    public allowIntersection = new formattingSettings.ToggleSwitch({
        name: "allowIntersection",
        displayNameKey: "Visual_Intersection",
        value: false
    });

    public name: string = "labels";
    public displayNameKey: string = "Visual_DataLabels";
    topLevelSlice: formattingSettings.ToggleSwitch = this.show;
    slices: FormattingSettingsSlice[] = [this.color, this.fontSize, this.allowIntersection];
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

class LinksSettings extends FormattingSettingsCard {
    public showArrow = new formattingSettings.ToggleSwitch({
        name: "showArrow",
        displayNameKey: "Visual_Arrow",
        value: false
    });

    public showLabel = new formattingSettings.ToggleSwitch({
        name: "showLabel",
        displayNameKey: "Visual_Label",
        descriptionKey: "Visual_Description_Label",
        value: false
    });

    public colorLink = new formattingSettings.ItemDropdown({
        name: "colorLink",
        displayNameKey: "Visual_Color",
        items: colorLinkOptions,
        value: colorLinkOptions[2],
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

    public name: string = "links";
    public displayNameKey: string = "Visual_ForceGraph_Links";
    slices: FormattingSettingsSlice[] = [this.showArrow, this.showLabel, this.colorLink, this.thickenLink, this.displayUnits, this.decimalPlaces];
}

class NodesSettings extends FormattingSettingsCard {
    public defaultImageValue: string = "Home";
    public defaultImageUrl: string = "";
    public defaultImageExt: string = ".png";
    public defaultNameMaxLength: number = 10;
    public fill: string = "#cccccc";
    public stroke: string = "#ffffff";

    public displayImage = new formattingSettings.ToggleSwitch({
        name: "displayImage",
        displayNameKey: "Visual_Image",
        value: false
    });

    public defaultImage = new formattingSettings.TextInput({
        name: "defaultImage",
        displayNameKey: "Visual_DefaultImage",
        value: this.defaultImageValue,
        placeholder: this.defaultImageValue
    });

    public imageUrl = new formattingSettings.TextInput({
        name: "imageUrl",
        displayNameKey: "Visual_ImageUrl",
        value: this.defaultImageUrl,
        placeholder: this.defaultImageUrl
    });

    public imageExt = new formattingSettings.TextInput({
        name: "imageExt",
        displayNameKey: "Visual_ImageExtension",
        value: this.defaultImageExt,
        placeholder: this.defaultImageExt
    });

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

    public name: string = "nodes";
    public displayNameKey: string = "Visual_Nodes";
    slices: FormattingSettingsSlice[] = [this.displayImage, this.defaultImage, this.imageUrl, this.imageExt, this.nameMaxLength, this.highlightReachableLinks];
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
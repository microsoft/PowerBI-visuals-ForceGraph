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

/*
 *  This file is based on or incorporates material from the projects listed below (Third Party IP).
 *  The original copyright notice and the license under which Microsoft received such Third Party IP,
 *  are set forth below. Such licenses and notices are provided for informational purposes only.
 *  Microsoft licenses the Third Party IP to you under the licensing terms for the Microsoft product.
 *  Microsoft reserves all other rights not expressly granted under this agreement, whether by
 *  implication, estoppel or otherwise.
 *
 *  d3 Force Layout
 *  Copyright (c) 2010-2015, Michael Bostock
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 *  * The name Michael Bostock may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 *  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 *  OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import "./../style/visual.less";
import { drag as d3Drag, D3DragEvent } from "d3-drag";
import { forceSimulation, forceLink, Simulation, forceManyBody, forceX, forceY} from "d3-force";
import { scaleLinear as d3ScaleLinear, ScaleLinear as d3ScaleLinearType } from "d3-scale";

import {
    select as d3Select,
    Selection as d3Selection
} from "d3-selection";
type Selection<T> = d3Selection<any, T, any, any>;

import isEmpty from "lodash.isempty";
import powerbi from "powerbi-visuals-api";

import IViewport = powerbi.IViewport;
import IColorPalette = powerbi.extensibility.IColorPalette;
import IVisual = powerbi.extensibility.visual.IVisual;

import DataView = powerbi.DataView;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

import { pixelConverter as PixelConverter } from "powerbi-visuals-utils-typeutils";
import * as SVGUtil from "powerbi-visuals-utils-svgutils";
import ClassAndSelector = SVGUtil.CssConstants.ClassAndSelector;
import createClassAndSelector = SVGUtil.CssConstants.createClassAndSelector;

import { IMargin, manipulation } from "powerbi-visuals-utils-svgutils";
import translate = manipulation.translate;

// powerbi.extensibility.utils.formatting
import { valueFormatter, textMeasurementService, interfaces } from "powerbi-visuals-utils-formattingutils";
import TextProperties = interfaces.TextProperties;
import IValueFormatter = valueFormatter.IValueFormatter;

import { ITooltipServiceWrapper, createTooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";
import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

import { ForceGraphColumns } from "./columns";
import { ForceGraphSettings, LinkColorType } from "./settings";
import { ForceGraphTooltipsFactory } from "./tooltipsFactory";
import { ForceGraphData, ForceGraphNode, ForceGraphNodes, ForceGraphLink, LinkedByName, ITextRect } from "./dataInterfaces";

import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

export class ForceGraph implements IVisual {

    private static Count: number = 0;
    private static VisualClassName: string = "forceGraph";
    private static getEvent = () => require("d3").event;

    private static DefaultImage: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAMAAAHNDTTxAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACuUExURQAAAMbGxvLy8sfHx/Hx8fLy8vHx8cnJycrKyvHx8fHx8cvLy/Ly8szMzM3NzfHx8dDQ0PHx8fLy8vHx8e/v79LS0tPT0/Ly8tTU1NXV1dbW1vHx8fHx8fDw8NjY2PT09PLy8vLy8vHx8fLy8vHx8fHx8enp6fDw8PLy8uPj4+Tk5OXl5fHx8b+/v/Pz8+bm5vHx8ejo6PLy8vHx8fLy8sTExPLy8vLy8sXFxfHx8YCtMbUAAAA6dFJOUwD/k/+b7/f///+r/////0z/w1RcEP//ZP///4fj/v8Yj3yXn/unDEhQ////YP9Y/8//aIMU/9+L/+fzC4s1AAAACXBIWXMAABcRAAAXEQHKJvM/AAABQElEQVQoU5WS61LCMBCFFymlwSPKVdACIgWkuNyL+P4v5ibZ0jKjP/xm0uw5ySa7mRItAhnMoIC5TwQZdCZiZjcoC8WU6EVsmZgzoqGdxafgvJAvjUXCb2M+0cXNsd/GDarZqSf7av3M2P1E3xhfLkPUvLD5joEYwVVJQXM6+9McWUwLf4nDTCQZAy96UoDjNI/jhl3xPLbQamu8xD7iaIsPKw7GJ7KZEnWLY3Gi8EFj5nqibXnwD5VEGjJXk5sbpLppfvvo1RazQVrhSopPK4TODrtnjS3dY4ic8KurruWQYF+UG60BacexTMyT2jlNg41dOmKvTpkUd/Jevy7ZxQ61ULRUpoododx8GeDPvIrktbFVdUsK6f8Na5VlVpjZJtowTXVy7kfXF5wCaV1tqXAFuIdWJu+JviaQzNzfQvQDGKRXXEmy83cAAAAASUVORK5CYII=";

    private static MinViewport: IViewport = {
        width: 1,
        height: 1
    };

    private static ImageViewport: IViewport = {
        width: 24,
        height: 24
    };

    private static ImagePosition: number = -12;
    private static MinNodeWeight: number = 5;
    private static GravityFactor: number = 100;
    private static LinkDistance: number = 100;
    private static HoverOpacity: number = 0.3;
    private static DefaultOpacity: number = 1;
    private static DefaultLinkColor: string = "#bbb";
    private static DefaultLinkHighlightColor: string = "#f00";
    private static DefaultLinkThickness: string = "1.5px";
    private static LabelsFontFamily: string = "sans-serif";
    private static MinRangeValue: number = 1;
    private static MaxRangeValue: number = 10;
    private static DefaultValueOfExistingLink: number = 1;
    private static DefaultLinkType: string = "";
    private static MinWeight: number = 0;
    private static MaxWeight: number = 0;
    private static DefaultSourceType: string = "";
    private static DefaultTargetType: string = "";
    private static StartOffset: string = "25%";
    private static DefaultLinkFillColor: string = "#000";
    private static LinkTextAnchor: string = "middle";
    private static DefaultLabelX: number = 12;
    private static DefaultLabelDy: string = ".35em";
    private static DefaultLabelText: string = "";
    private static ResolutionFactor: number = 20;
    private static ResolutionFactorBoundByBox: number = 0.9;
    private static LinkSelector: ClassAndSelector = createClassAndSelector("link");
    private static LinkLabelHolderSelector: ClassAndSelector = createClassAndSelector("linklabelholder");
    private static LinkLabelSelector: ClassAndSelector = createClassAndSelector("linklabel");
    private static NodeSelector: ClassAndSelector = createClassAndSelector("node");
    private static NoAnimationLimit: number = 200;

    private selectionManager: ISelectionManager;
    private host: IVisualHost;
    private settings: ForceGraphSettings;
    private formattingSettingsService: FormattingSettingsService;

    private static get Href(): string {
        return window.location.href.replace(window.location.hash, "");
    }

    private static substractMargin(viewport: IViewport, margin: IMargin): IViewport {
        return {
            width: Math.max(viewport.width - (margin.left + margin.right), 0),
            height: Math.max(viewport.height - (margin.top + margin.bottom), 0)
        };
    }

    private defaultYPosition: number = -6;
    private defaultYOffset: number = -2;

    private container: Selection<any>;
    private paths: Selection<ForceGraphLink>;
    private nodes: Selection<ForceGraphNode>;
    private forceSimulation: Simulation<ForceGraphNode, ForceGraphLink>;

    private colorPalette: IColorPalette;
    private colorHelper: ColorHelper;

    private uniqieId: string = `_${ForceGraph.Count++}_`;

    private marginValue: IMargin;

    private get margin(): IMargin {
        return this.marginValue || { left: 0, right: 0, top: 0, bottom: 0 };
    }

    private set margin(value: IMargin) {
        this.marginValue = { ...value };
        this.viewportInValue = ForceGraph.substractMargin(this.viewport, this.margin);
    }

    private viewportValue: IViewport;

    private get viewport(): IViewport {
        return this.viewportValue || { ...ForceGraph.MinViewport };
    }

    private set viewport(viewport: IViewport) {
        this.viewportValue = ForceGraph.getViewport(viewport);
        this.viewportInValue = ForceGraph.getViewport(
            ForceGraph.substractMargin(this.viewport, this.margin));
    }

    private viewportInValue: IViewport;

    private get viewportIn(): IViewport {
        return this.viewportInValue || this.viewport;
    }

    private data: ForceGraphData;

    private tooltipServiceWrapper: ITooltipServiceWrapper;

    constructor(options: VisualConstructorOptions) {
        this.selectionManager = options.host.createSelectionManager();
        this.host = options.host;
        this.init(options);
    }

    private init(options: VisualConstructorOptions): void {
        const root: Selection<any> = d3Select(options.element);
        this.colorPalette = options.host.colorPalette;

        const localizationManager = this.host.createLocalizationManager();
        this.formattingSettingsService = new FormattingSettingsService(localizationManager);

        this.colorHelper = new ColorHelper(this.colorPalette);

        this.tooltipServiceWrapper = createTooltipServiceWrapper(
            options.host.tooltipService,
            options.element
        );

        this.forceSimulation = forceSimulation<ForceGraphNode, ForceGraphLink>();

        const svg: Selection<any> = root
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .classed(ForceGraph.VisualClassName, true);
        this.container = svg.append("g").classed("chartContainer", true);
    }

    private static getViewport(viewport: IViewport): IViewport {
        const { width, height } = viewport;

        return {
            width: Math.max(ForceGraph.MinViewport.width, width),
            height: Math.max(ForceGraph.MinViewport.height, height)
        };
    }

    private scale1to10(value: number): number {
        const scale: d3ScaleLinearType<number, number> = d3ScaleLinear()
            .domain([
                this.data.minFiles,
                this.data.maxFiles
            ])
            .rangeRound([
                ForceGraph.MinRangeValue,
                ForceGraph.MaxRangeValue
            ])
            .clamp(true);

        return scale(value);
    }

    private getLinkColor(
        link: ForceGraphLink,
        colorPalette: IColorPalette,
        colorHelper: ColorHelper,
    ): string {
        if (colorHelper.isHighContrast) {
            return colorHelper.getThemeColor("foreground");
        }

        switch (this.settings.links.colorLink.value.value) {
            case LinkColorType.ByWeight: {
                return colorPalette
                    .getColor(this.scale1to10(link.weight).toString())
                    .value;
            }
            case LinkColorType.ByLinkType: {
                return link.linkType && this.data.linkTypes[link.linkType]
                    ? this.data.linkTypes[link.linkType].color
                    : ForceGraph.DefaultLinkColor;
            }
        }

        return ForceGraph.DefaultLinkColor;
    }

    public static converter(
        dataView: DataView,
        colorPalette: IColorPalette,
        colorHelper: ColorHelper,
        host: IVisualHost,
        settings: ForceGraphSettings
    ): ForceGraphData {

        const metadata: ForceGraphColumns<DataViewMetadataColumn> = ForceGraphColumns.getMetadataColumns(dataView);
        const nodes: ForceGraphNodes = {};

        let minFiles: number = Number.MAX_VALUE;
        let maxFiles: number = 0;

        const linkedByName: LinkedByName = {};
        const links: ForceGraphLink[] = [];
        const linkDataPoints = {};

        let linkTypeCount: number = 0;

        if (!metadata || !metadata.Source || !metadata.Target) {
            return null;
        }

        const categorical: ForceGraphColumns<DataViewCategoryColumn & DataViewValueColumn[]>
            = ForceGraphColumns.getCategoricalColumns(dataView);

        if (!categorical
            || !categorical.Source
            || !categorical.Target
            || isEmpty(categorical.Source.source)
            || isEmpty(categorical.Source.values)
            || isEmpty(categorical.Target.source)
            || isEmpty(categorical.Target.values)
        ) {
            return null;
        }

        const sourceCategories: any[] = categorical.Source.values,
            targetCategories: any[] = categorical.Target.values,
            sourceTypeCategories: any[] = (categorical.SourceType || { values: [] }).values,
            targetTypeCategories: any[] = (categorical.TargetType || { values: [] }).values,
            linkTypeCategories: any[] = (categorical.LinkType || { values: [] }).values,
            weightValues: any[] = (categorical.Weight && categorical.Weight[0] || { values: [] }).values;

        let weightFormatter: IValueFormatter = null;

        if (metadata.Weight) {
            let weightValue: number = +settings.links.displayUnits.value;

            if (!weightValue && categorical.Weight && categorical.Weight.length) {
                weightValue = categorical.Weight[0].maxLocal as number;
            }

            weightFormatter = valueFormatter.create({
                format: valueFormatter.getFormatStringByColumn(metadata.Weight, true),
                precision: settings.links.decimalPlaces.value,
                value: weightValue
            });
        }

        const sourceFormatter: IValueFormatter = valueFormatter.create({
            format: valueFormatter.getFormatStringByColumn(metadata.Source, true),
        });

        const targetFormatter: IValueFormatter = valueFormatter.create({
            format: valueFormatter.getFormatStringByColumn(metadata.Target, true),
        });

        for (let i = 0; i < targetCategories.length; i++) {
            const source = sourceCategories[i];
            const target = targetCategories[i];
            const targetType = targetTypeCategories[i];
            const sourceType = sourceTypeCategories[i];
            const linkType = linkTypeCategories[i];
            const weight = weightValues[i];

            linkedByName[`${source},${target}`] = ForceGraph.DefaultValueOfExistingLink;

            if (!nodes[source]) {
                nodes[source] = {
                    name: sourceFormatter.format(source),
                    hideLabel: false,
                    image: sourceType || ForceGraph.DefaultSourceType,
                    adj: {},
                    identity: host.createSelectionIdBuilder()
                        .withCategory(categorical.Source, i)
                        .withMeasure(<string>categorical.Source.values[i])
                        .createSelectionId()
                };
            }

            if (!nodes[target]) {
                nodes[target] = {
                    name: targetFormatter.format(target),
                    hideLabel: false,
                    image: targetType || ForceGraph.DefaultTargetType,
                    adj: {},
                    identity: host.createSelectionIdBuilder()
                        .withCategory(categorical.Target, i)
                        .withMeasure(<string>categorical.Target.values[i])
                        .createSelectionId()
                };
            }

            const sourceNode: ForceGraphNode = nodes[source],
                targetNode: ForceGraphNode = nodes[target];

            sourceNode.adj[targetNode.name] = ForceGraph.DefaultValueOfExistingLink;
            targetNode.adj[sourceNode.name] = ForceGraph.DefaultValueOfExistingLink;

            const tooltipInfo: VisualTooltipDataItem[] = ForceGraphTooltipsFactory.build(
                {
                    Source: source,
                    Target: target,
                    Weight: weight,
                    LinkType: linkType,
                    SourceType: sourceType,
                    TargetType: targetType
                },
                dataView.metadata.columns
            );

            const link: ForceGraphLink = {
                source: sourceNode,
                target: targetNode,
                weight: Math.max(metadata.Weight
                    ? (weight || ForceGraph.MinWeight)
                    : ForceGraph.MaxWeight,
                    ForceGraph.MinWeight),
                formattedWeight: weight && weightFormatter.format(weight),
                linkType: linkType || ForceGraph.DefaultLinkType,
                tooltipInfo: tooltipInfo
            };

            if (metadata.LinkType && !linkDataPoints[linkType]) {
                const color: string = colorHelper.getHighContrastColor(
                    "foreground",
                    colorPalette.getColor((linkTypeCount++).toString()).value
                );

                linkDataPoints[linkType] = {
                    color,
                    label: linkType,
                };
            }

            if (link.weight < minFiles) {
                minFiles = link.weight;
            }

            if (link.weight > maxFiles) {
                maxFiles = link.weight;
            }

            links.push(link);
        }

        return {
            nodes,
            links,
            minFiles,
            maxFiles,
            linkedByName,
            settings,
            linkTypes: linkDataPoints,
            formatter: targetFormatter
        };
    }

    private isIntersect(textRect1: ITextRect, textRect2: ITextRect): boolean {
        let intersectY: boolean = false;
        let intersectX: boolean = false;

        if (textRect1.y1 <= textRect2.y1 && textRect2.y1 <= textRect1.y2) {
            intersectY = true;
        }
        if (textRect1.y1 <= textRect2.y2 && textRect2.y2 <= textRect1.y2) {
            intersectY = true;
        }
        if (textRect2.y2 <= textRect1.y1 && textRect1.y1 <= textRect2.y1) {
            intersectY = true;
        }
        if (textRect2.y2 <= textRect1.y2 && textRect1.y2 <= textRect2.y1) {
            intersectY = true;
        }

        if (textRect1.x1 <= textRect2.x1 && textRect2.x1 <= textRect1.x2) {
            intersectX = true;
        }
        if (textRect1.x1 <= textRect2.x2 && textRect2.x2 <= textRect1.x2) {
            intersectX = true;
        }
        if (textRect2.x2 <= textRect1.x1 && textRect1.x1 <= textRect2.x1) {
            intersectX = true;
        }
        if (textRect2.x2 <= textRect1.x2 && textRect1.x2 <= textRect2.x1) {
            intersectX = true;
        }

        return intersectX && intersectY;
    }

    public update(options: VisualUpdateOptions): void {
        if (!options
            || !options.dataViews
            || !options.dataViews[0]
        ) {
            return;
        }

        this.settings = this.formattingSettingsService.populateFormattingSettingsModel(ForceGraphSettings, options.dataViews[0]);

        this.data = ForceGraph.converter(
            options.dataViews[0],
            this.colorPalette,
            this.colorHelper,
            this.host,
            this.settings
        );

        if (!this.data) {
            this.reset();
            return;
        }

        this.viewport = options.viewport;

        const k: number = Math.sqrt(Object.keys(this.data.nodes).length /
            (this.viewport.width * this.viewport.height));

        this.reset();

        this.forceSimulation
            .force("link", forceLink(this.data.links).distance(ForceGraph.LinkDistance))
            .force("x", forceX(this.viewport.width / 2).strength(ForceGraph.GravityFactor * k))
            .force("y", forceY(this.viewport.height / 2).strength(ForceGraph.GravityFactor * k))
            .force("charge", forceManyBody().strength(this.settings.size.charge.value / k));

        this.updateNodes();

        const nodesNum: number = Object.keys(this.data.nodes).length;
        const theta: number = 1.4;

        if (this.settings.animation.show.value && nodesNum <= ForceGraph.NoAnimationLimit) {
            this.forceSimulation.on("tick", this.getForceTick());
            this.forceSimulation.force("theta", forceManyBody().theta(theta)).restart();
            this.setVisualData(this.container, this.colorPalette, this.colorHelper);
        } else {
            this.forceSimulation.force("theta", forceManyBody().theta(theta)).restart();

            for (let i = 0; i < nodesNum; ++i) {
                this.forceSimulation.tick();
            }

            this.forceSimulation.stop();
            this.setVisualData(this.container, this.colorPalette, this.colorHelper);
            this.forceSimulation.on("tick", this.getForceTick());
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        const model = this.formattingSettingsService.buildFormattingModel(this.settings);
        return model;
    }

    private setVisualData(
        svg: Selection<any>,
        colorPalette: IColorPalette,
        colorHelper: ColorHelper,
    ): void {
        this.paths = svg.selectAll(ForceGraph.LinkSelector.selectorName)
            .data(this.data.links)
            .enter()
            .append("path")
            .attr("id", (d, i) => "linkid_" + this.uniqieId + i)
            .attr("stroke-width", (link: ForceGraphLink) => {
                return this.settings.links.thickenLink.value
                    ? this.scale1to10(link.weight)
                    : ForceGraph.DefaultLinkThickness;
            })
            .classed(ForceGraph.LinkSelector.className, true)
            .style("stroke", (link: ForceGraphLink) => {
                return this.getLinkColor(link, colorPalette, colorHelper);
            })
            .style("fill", (link: ForceGraphLink) => {
                if (this.settings.links.showArrow.value && link.source !== link.target) {
                    return this.getLinkColor(link, colorPalette, colorHelper);
                }
            })
            .on("mouseover", () => {

                return this.fadePath(
                    ForceGraph.HoverOpacity,
                    colorHelper.getHighContrastColor("foreground", ForceGraph.DefaultLinkHighlightColor),
                    colorHelper.getHighContrastColor("foreground", ForceGraph.DefaultLinkColor)
                );
            })
            .on("mouseout", () => {
                return this.fadePath(
                    ForceGraph.DefaultOpacity,
                    colorHelper.getHighContrastColor("foreground", ForceGraph.DefaultLinkColor),
                    colorHelper.getHighContrastColor("foreground", ForceGraph.DefaultLinkColor)
                );
            });

        this.tooltipServiceWrapper.addTooltip(
            this.paths,
            (data: ForceGraphLink) => data.tooltipInfo
        );

        if (this.settings.links.showLabel.value) {
            const linklabelholderUpdate: Selection<ForceGraphLink> = svg
                .selectAll(ForceGraph.LinkLabelHolderSelector.selectorName)
                .data(this.data.links);

            linklabelholderUpdate.enter()
                .append("g")
                .classed(ForceGraph.LinkLabelHolderSelector.className, true)
                .append("text")
                .classed(ForceGraph.LinkLabelSelector.className, true)
                .attr("dy", (link: ForceGraphLink) => {
                    return this.settings.links.thickenLink.value
                        ? -this.scale1to10(link.weight) + this.defaultYOffset
                        : this.defaultYPosition;
                })
                .attr("text-anchor", ForceGraph.LinkTextAnchor)
                .style("fill", colorHelper.getHighContrastColor("foreground", ForceGraph.DefaultLinkFillColor))
                .append("textPath")
                .attr("xlink:href", (link: ForceGraphLink, index: number) => {
                    return ForceGraph.Href + "#linkid_" + this.uniqieId + index;
                })
                .attr("startOffset", ForceGraph.StartOffset)
                .text((link: ForceGraphLink) => {
                    return this.settings.links.colorLink.value.value === LinkColorType.ByLinkType
                        ? link.linkType
                        : link.formattedWeight;
                });

            linklabelholderUpdate
                .exit()
                .remove();
        }

        const nodesNum: number = Object.keys(this.data.nodes).length;
        const selectionManager = this.selectionManager;

        // define the nodes
        this.nodes = svg.selectAll(ForceGraph.NodeSelector.selectorName)
            .data(Object.values(this.data.nodes))
            .enter()
            .append("g")
            .attr("drag-resize-disabled", true)
            .classed(ForceGraph.NodeSelector.className, true)
            .on("mouseover", (node: ForceGraphNode) => {
                node.isOver = true;
                this.fadeNode(node);
            })
            .on("mouseout", (node: ForceGraphNode) => {
                node.isOver = false;
                this.fadeNode(node);
            })
            .on("click", function (event: PointerEvent, dp: ForceGraphNode) {
                selectionManager.select(dp.identity);

                event.stopPropagation();
            });

        if (nodesNum <= ForceGraph.NoAnimationLimit) {
            const drag = d3Drag()
                .on("start", ((event: D3DragEvent<Element, ForceGraphNode, ForceGraphNode>, d: ForceGraphNode) => {
                    if (!event.active) 
                        this.forceSimulation.alphaTarget(0.3).restart();
                    d.isDrag = true;
                    this.fadeNode(d);
                }))
                .on("end", ((event: D3DragEvent<Element, ForceGraphNode, ForceGraphNode>, d: ForceGraphNode) => {
                    if (!event.active) 
                        this.forceSimulation.alphaTarget(0);
                    d.isDrag = false;
                    this.fadeNode(d);
                }))
                .on("drag", (event: D3DragEvent<Element, ForceGraphNode, ForceGraphNode>, d: ForceGraphNode) => {
                    d.x = event.x;
                    d.y = event.y;
                    this.fadeNode(d);
                    this.forceSimulation.tick();
                });
            this.nodes.call(drag);
        }

        // render without animation
        if (!this.settings.animation.show.value || nodesNum > ForceGraph.NoAnimationLimit) {
            const viewport: IViewport = this.viewportIn;

            const maxWidth: number = viewport.width * ForceGraph.ResolutionFactor,
                maxHeight: number = viewport.height * ForceGraph.ResolutionFactor,
                limitX = x => Math.max((viewport.width - maxWidth) / 2, Math.min((viewport.width + maxWidth) / 2, x)),
                limitY = y => Math.max((viewport.height - maxHeight) / 2, Math.min((viewport.height + maxHeight) / 2, y));

            this.paths.attr("d", (link: ForceGraphLink) => {
                link.source.x = limitX(link.source.x);
                link.source.y = limitY(link.source.y);
                link.target.x = limitX(link.target.x);
                link.target.y = limitY(link.target.y);

                return this.settings && this.settings.links && this.settings.links.showArrow.value
                    ? this.getPathWithArrow(link)
                    : this.getPathWithoutArrow(link);
            });

            this.nodes.attr("transform", (node: ForceGraphNode) => translate(limitX(node.x), limitY(node.y)));
        }

        // add the nodes
        if (this.settings.nodes.displayImage.value) {
            this.nodes.append("image")
                .attr("x", PixelConverter.toString(ForceGraph.ImagePosition))
                .attr("y", PixelConverter.toString(ForceGraph.ImagePosition))
                .attr("width", PixelConverter.toString(ForceGraph.ImageViewport.width))
                .attr("height", PixelConverter.toString(ForceGraph.ImageViewport.height))
                .attr("xlink:href", (node: ForceGraphNode) => {
                    if (node.image) {
                        return this.getImage(node.image);
                    } else if (this.settings.nodes.defaultImage) {
                        return this.getImage(this.settings.nodes.defaultImage.value);
                    }

                    return ForceGraph.DefaultImage;
                })
                .attr("title", (node: ForceGraphNode) => node.name);
        } else {
            this.nodes
                .append("circle")
                .attr("r", (node: ForceGraphNode) => {
                    return isNaN(node.weight) || node.weight < ForceGraph.MinNodeWeight
                        ? ForceGraph.MinNodeWeight
                        : node.weight;
                })
                .style("fill", this.settings.nodes.fill)
                .style("stroke", this.settings.nodes.stroke);
        }

        // add the text
        if (this.settings.labels.show.value) {
            this.nodes.append("text")
                .attr("x", ForceGraph.DefaultLabelX)
                .attr("dy", ForceGraph.DefaultLabelDy)
                .style("fill", this.settings.labels.color.value.value)
                .style("font-size", PixelConverter.fromPoint(this.settings.labels.fontSize.value))
                .text((node: ForceGraphNode) => {
                    if (node.name) {
                        if (node.name.length > this.settings.nodes.nameMaxLength.value) {
                            return node.name.substr(0, this.settings.nodes.nameMaxLength.value);
                        } else {
                            return node.name;
                        }
                    } else {
                        return ForceGraph.DefaultLabelText;
                    }
                });
        }
    }
    private getImage(image: string): string {
        return `${this.settings.nodes.imageUrl}${image}${this.settings.nodes.imageExt}`;
    }

    private reset(): void {
        if (this.container.empty()) {
            return;
        }
        this.forceSimulation.on("tick", null);
        this.forceSimulation.stop();
        this.container
            .selectAll("*")
            .remove();
    }

    private updateNodes(): void {
        const thePreviousNodes: ForceGraphNode[] = this.forceSimulation.nodes();
        this.forceSimulation.nodes(Object.values(this.data.nodes));

        this.forceSimulation.nodes().forEach((node: ForceGraphNode, index: number) => {
            if (!thePreviousNodes[index]) {
                return;
            }

            this.updateNodeAttributes(node, thePreviousNodes[index]);
        });
    }

    private updateNodeAttributes(first: ForceGraphNode, second: ForceGraphNode): void {
        first.x = second.x;
        first.y = second.y;
        first.weight = second.weight;
    }

    private getForceTick(): () => void {
        const viewport: IViewport = this.viewportIn;
        const properties: TextProperties = {
            fontFamily: ForceGraph.LabelsFontFamily,
            fontSize: PixelConverter.fromPoint(this.settings.labels.fontSize.value),
            text: this.data.formatter.format("")
        };

        const showArrow: boolean = this.settings.links.showArrow.value;

        let resolutionFactor: number = ForceGraph.ResolutionFactor;
        if (this.settings.size.boundedByBox.value) {
            resolutionFactor = ForceGraph.ResolutionFactorBoundByBox;
        }
        // limitX and limitY is necessary when you minimize the graph and then resize it to normal.
        // "width/height * 20" seems enough to move nodes freely by force layout.
        const maxWidth: number = viewport.width * resolutionFactor,
            maxHeight: number = viewport.height * resolutionFactor,
            viewPortWidthDownLimit: number = (viewport.width - maxWidth) / 2,
            viewPortHeightDownLimit: number = (viewport.height - maxHeight) / 2,
            viewPortHeightUpLimit: number = (viewport.height + maxHeight) / 2,
            viewPortWidthUpLimit: number = (viewport.height + maxHeight) / 2,
            limitX: (x: number) => number = x => Math.max(viewPortWidthDownLimit, Math.min(viewPortWidthUpLimit, x)),
            limitY: (y: number) => number = y => Math.max(viewPortHeightDownLimit, Math.min(viewPortHeightUpLimit, y));

        return () => {
            this.paths.attr("d", (link: ForceGraphLink) => {
                link.source.x = limitX(link.source.x);
                link.source.y = limitY(link.source.y);
                link.target.x = limitX(link.target.x);
                link.target.y = limitY(link.target.y);

                return showArrow
                    ? this.getPathWithArrow(link)
                    : this.getPathWithoutArrow(link);
            });

            this.nodes.attr("transform", (node: ForceGraphNode) => translate(limitX(node.x), limitY(node.y)));

            if (!this.settings.labels.allowIntersection.value
                && this.settings.labels.show.value
                && Object.keys(this.data.nodes).length <= ForceGraph.NoAnimationLimit) {
                this.nodes
                    .classed("hiddenLabel", (node: ForceGraphNode) => {
                        properties.text = this.data.formatter.format(node.name);
                        const curNodeTextRect: ITextRect = this.getTextRect(properties, node.x, node.y);

                        node.hideLabel = false;
                        this.nodes.each((otherNode: ForceGraphNode) => {
                            properties.text = this.data.formatter.format(otherNode.name);
                            const otherNodeTextRect: ITextRect = this.getTextRect(properties, otherNode.x, otherNode.y);
                            if (!otherNode.hideLabel && node.name !== otherNode.name && this.isIntersect(curNodeTextRect, otherNodeTextRect)) {
                                node.hideLabel = true;
                                return;
                            }
                        });

                        return node.hideLabel;
                    });
            }

        };
    }

    private getTextRect(properties: TextProperties, x: number, y: number): ITextRect {
        const textHeight: number = textMeasurementService.estimateSvgTextHeight(properties);
        const textWidth: number = textMeasurementService.measureSvgTextWidth(properties);
        const curTextUpperPointX: number = x + textWidth;
        const curTextUpperPointY: number = y - textHeight;

        return <ITextRect>{
            x1: x,
            y1: y,
            x2: curTextUpperPointX,
            y2: curTextUpperPointY
        };
    }

    private getPathWithArrow(link: ForceGraphLink): string {
        const dx: number = link.target.x - link.source.x,
            dy: number = link.target.y - link.source.y,
            dr: number = Math.sqrt(dx * dx + dy * dy),
            theta: number = Math.atan2(dy, dx) + Math.PI / 7.85,
            d90: number = Math.PI / 2,
            dtxs: number = link.target.x - 6 * Math.cos(theta),
            dtys: number = link.target.y - 6 * Math.sin(theta);

        if (dr === 0) {
            return `M ${link.source.x - 10} ${link.source.y - 10} C ${link.source.x - 50} ${link.source.y - 50}, ${link.source.x + 50} ${link.source.y - 50}, ${link.source.x + 10} ${link.source.y - 10}`;
        }

        return "M" + link.source.x + "," + link.source.y
            + "A" + dr + "," + dr + " 0 0 1," + link.target.x + "," + link.target.y
            + "A" + dr + "," + dr + " 0 0 0," + link.source.x + "," + link.source.y
            + "M" + dtxs + "," + dtys
            + "l" + (3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (-3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta))
            + "L" + (dtxs - 3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (dtys + 3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta))
            + "z";
    }

    private getPathWithoutArrow(link: ForceGraphLink): string {
        const dx: number = link.target.x - link.source.x,
            dy: number = link.target.y - link.source.y,
            dr: number = Math.sqrt(dx * dx + dy * dy);

        if (dr === 0) {
            return `M ${link.source.x - 10} ${link.source.y - 10} C ${link.source.x - 50} ${link.source.y - 50}, ${link.source.x + 50} ${link.source.y - 50}, ${link.source.x + 10} ${link.source.y - 10}`;
        }

        return "M" + link.source.x + "," + link.source.y
            + "A" + dr + "," + dr + " 0 0,1 " + link.target.x + "," + link.target.y;
    }

    private fadePath(
        opacity: number,
        highlightColor: string,
        defaultHighlightColor: string
    ): (link: ForceGraphLink) => void {
        if (this.settings.links.colorLink.value.value !== LinkColorType.Interactive) {
            return;
        }

        return () => {
            this.paths.style("stroke-opacity", (link: ForceGraphLink) => {
                return link.source === link.source && link.target === link.target
                    ? ForceGraph.DefaultOpacity
                    : opacity;
            })
                .style("stroke", (link: ForceGraphLink) => {
                    return link.source === link.source && link.target === link.target
                        ? highlightColor
                        : defaultHighlightColor;
                });
        };
    }

    private isReachable(a: ForceGraphNode, b: ForceGraphNode): boolean {
        if (a.name === b.name || this.data.linkedByName[a.name + "," + b.name]) {
            return true;
        }

        const visited = {};

        for (const name in this.data.nodes) {
            visited[name] = false;
        }

        visited[a.name] = true;

        const stack = [];

        stack.push(a.name);

        while (stack.length > 0) {
            const cur = stack.pop(),
                node = this.data.nodes[cur];

            if (node && node.adj) {
                for (const nb in node.adj) {
                    if (nb === b.name) {
                        return true;
                    }

                    if (!visited[nb]) {
                        visited[nb] = true;
                        stack.push(nb);
                    }
                }
            }
        }

        return false;
    }

    private fadeNode(node: ForceGraphNode): void {
        if (!this.settings || this.settings.links.colorLink.value.value !== LinkColorType.Interactive) {
            return;
        }

        // eslint-disable-next-line
        const self: ForceGraph = this,
            isHighlight = node.isOver || node.isDrag,
            opacity: number = isHighlight
                ? ForceGraph.HoverOpacity
                : ForceGraph.DefaultOpacity;

        const highlight: string = isHighlight
            ? ForceGraph.DefaultLinkHighlightColor
            : ForceGraph.DefaultLinkColor;

        this.nodes.style("stroke-opacity", function (otherNode: ForceGraphNode) {
            const thisOpacity: number = (self.settings.nodes.highlightReachableLinks.value
                ? self.isReachable(node, otherNode)
                : self.areNodesConnected(node, otherNode))
                ? ForceGraph.DefaultOpacity
                : opacity;
            this.setAttribute("fill-opacity", thisOpacity);

            return thisOpacity;
        });

        this.paths.style("stroke-opacity", (link: ForceGraphLink) =>
            (this.settings.nodes.highlightReachableLinks.value
                ? this.isReachable(node, link.source)
                : (link.source === node || link.target === node))
                ? ForceGraph.DefaultOpacity
                : opacity
        );

        this.paths.style("stroke", (link: ForceGraphLink) => {
            const color = (this.settings.nodes.highlightReachableLinks.value
                ? this.isReachable(node, link.source)
                : (link.source === node || link.target === node))
                ? highlight
                : ForceGraph.DefaultLinkColor;

            return this.colorHelper.getHighContrastColor(
                "foreground",
                color
            );
        });
    }

    private areNodesConnected(firstNode: ForceGraphNode, secondNode: ForceGraphNode): number | boolean {
        return this.data.linkedByName[firstNode.name + "," + secondNode.name]
            || this.data.linkedByName[secondNode.name + "," + firstNode.name]
            || firstNode.name === secondNode.name;
    }

    public destroy(): void {
        this.container.selectAll("*")
            .remove();
    }
}

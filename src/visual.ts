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

module powerbi.extensibility.visual {
    // powerbi
    import DataView = powerbi.DataView;
    import IViewport = powerbi.IViewport;
    import VisualDataRoleKind = powerbi.VisualDataRoleKind;
    import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
    import IEnumType = powerbi.IEnumType;
    import VisualObjectInstance = powerbi.VisualObjectInstance;
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import IEnumMember = powerbi.IEnumMember;
    import DataViewObjects = powerbi.DataViewObjects;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
    import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;

    // powerbi.extensibility
    import IColorPalette = powerbi.extensibility.IColorPalette;

    // powerbi.extensibility.visual
    import IVisual = powerbi.extensibility.visual.IVisual;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

    // powerbi.extensibility.utils.type
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;

    // powerbi.extensibility.utils.svg
    import IMargin = powerbi.extensibility.utils.svg.IMargin;
    import translate = powerbi.extensibility.utils.svg.translate;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;

    // powerbi.extensibility.utils.formatting
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;

    // powerbi.extensibility.utils.tooltip
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;

    interface ValueLimitation {
        (x: any): number;
    }

    export class ForceGraph implements IVisual {
        private static Count: number = 0;
        private static VisualClassName: string = 'forceGraph';

        private static DefaultImage: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAMAAAHNDTTxAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACuUExURQAAAMbGxvLy8sfHx/Hx8fLy8vHx8cnJycrKyvHx8fHx8cvLy/Ly8szMzM3NzfHx8dDQ0PHx8fLy8vHx8e/v79LS0tPT0/Ly8tTU1NXV1dbW1vHx8fHx8fDw8NjY2PT09PLy8vLy8vHx8fLy8vHx8fHx8enp6fDw8PLy8uPj4+Tk5OXl5fHx8b+/v/Pz8+bm5vHx8ejo6PLy8vHx8fLy8sTExPLy8vLy8sXFxfHx8YCtMbUAAAA6dFJOUwD/k/+b7/f///+r/////0z/w1RcEP//ZP///4fj/v8Yj3yXn/unDEhQ////YP9Y/8//aIMU/9+L/+fzC4s1AAAACXBIWXMAABcRAAAXEQHKJvM/AAABQElEQVQoU5WS61LCMBCFFymlwSPKVdACIgWkuNyL+P4v5ibZ0jKjP/xm0uw5ySa7mRItAhnMoIC5TwQZdCZiZjcoC8WU6EVsmZgzoqGdxafgvJAvjUXCb2M+0cXNsd/GDarZqSf7av3M2P1E3xhfLkPUvLD5joEYwVVJQXM6+9McWUwLf4nDTCQZAy96UoDjNI/jhl3xPLbQamu8xD7iaIsPKw7GJ7KZEnWLY3Gi8EFj5nqibXnwD5VEGjJXk5sbpLppfvvo1RazQVrhSopPK4TODrtnjS3dY4ic8KurruWQYF+UG60BacexTMyT2jlNg41dOmKvTpkUd/Jevy7ZxQ61ULRUpoododx8GeDPvIrktbFVdUsK6f8Na5VlVpjZJtowTXVy7kfXF5wCaV1tqXAFuIdWJu+JviaQzNzfQvQDGKRXXEmy83cAAAAASUVORK5CYII=';

        private static MinViewport: IViewport = {
            width: 1,
            height: 1
        };

        private static ImageViewport: IViewport = {
            width: 24,
            height: 24
        };

        private static MinAmountOfDataViews: number = 1;

        private static ImagePosition: number = -12;

        private static MinNodeWeight: number = 5;

        private static MinCharge: number = -100;
        private static MaxCharge: number = -0.1;

        private static MinDecimalPlaces: number = 0;
        private static MaxDecimalPlaces: number = 5;

        private static GravityFactor: number = 100;
        private static LinkDistance: number = 100;

        private static HoverOpacity: number = 0.3;
        private static DefaultOpacity: number = 1;

        private static DefaultLinkColor: string = '#bbb';
        private static DefaultLinkHighlightColor: string = '#f00';
        private static DefaultLinkThickness: string = '1.5px';

        private static MinRangeValue: number = 1;
        private static MaxRangeValue: number = 10;

        private static DefaultValueOfExistingLink: number = 1;
        private static DefaultLinkType: string = '';

        private static MinWeight: number = 0;
        private static MaxWeight: number = 0;

        private static DefaultSourceType: string = '';
        private static DefaultTargetType: string = '';

        private static StartOffset: string = '25%';
        private static DefaultYPosition: number = -12;
        private static DefaultLinkFillColor: string = '#000';
        private static LinkTextAnchor: string = 'middle';

        private static DefaultLabelX: number = 12;
        private static DefaultLabelDy: string = '.35em';

        private static DefaultLabelText: string = '';

        private static ResolutionFactor: number = 20;

        private static LinkSelector: ClassAndSelector = createClassAndSelector('link');
        private static LinkLabelHolderSelector: ClassAndSelector = createClassAndSelector('linklabelholder');
        private static LinkLabelSelector: ClassAndSelector = createClassAndSelector('linklabel');
        private static NodeSelector: ClassAndSelector = createClassAndSelector('node');

        private static get Href(): string {
            return window.location.href.replace(window.location.hash, '');
        }

        private static substractMargin(viewport: IViewport, margin: IMargin): IViewport {
            return {
                width: Math.max(viewport.width - (margin.left + margin.right), 0),
                height: Math.max(viewport.height - (margin.top + margin.bottom), 0)
            };
        }

        private get settings(): ForceGraphSettings {
            return this.data && this.data.settings;
        }

        private root: d3.Selection<any>;
        private paths: d3.Selection<ForceGraphLink>;
        private nodes: d3.Selection<ForceGraphNode>;
        private forceLayout: d3.layout.Force<ForceGraphLink, ForceGraphNode>;

        private colorPalette: IColorPalette;
        private uniqieId: string = `_${ForceGraph.Count++}_`;

        private marginValue: IMargin;

        private get margin(): IMargin {
            return this.marginValue || { left: 0, right: 0, top: 0, bottom: 0 };
        }

        private set margin(value: IMargin) {
            this.marginValue = $.extend({}, value);
            this.viewportInValue = ForceGraph.substractMargin(this.viewport, this.margin);
        }

        private viewportValue: IViewport;

        private get viewport(): IViewport {
            return this.viewportValue || $.extend({}, ForceGraph.MinViewport);
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
            this.init(options);
        }

        private init(options: VisualConstructorOptions): void {
            this.root = d3.select(options.element);

            this.forceLayout = d3.layout.force<ForceGraphLink, ForceGraphNode>();

            this.forceLayout.drag()
                .on('dragstart', ((d: ForceGraphNode) => {
                    d.isDrag = true;
                    this.fadeNode(d);
                }))
                .on('dragend', ((d: ForceGraphNode) => {
                    d.isDrag = false;
                    this.fadeNode(d);
                }))
                .on('drag', ((d: ForceGraphNode) => this.fadeNode(d)));

            this.colorPalette = options.host.colorPalette;

            this.tooltipServiceWrapper = createTooltipServiceWrapper(
                options.host.tooltipService,
                options.element);
        }

        private static getViewport(viewport: IViewport): IViewport {
            const { width, height } = viewport;

            return {
                width: Math.max(ForceGraph.MinViewport.width, width),
                height: Math.max(ForceGraph.MinViewport.height, height)
            };
        };

        private scale1to10(value: number): number {
            let scale: d3.scale.Linear<number, number> = d3.scale.linear()
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

        private getLinkColor(link: ForceGraphLink): string {
            switch (this.settings.links.colorLink) {
                case LinkColorType.ByWeight: {
                    return this.colorPalette
                        .getColor(this.scale1to10(link.weight).toString())
                        .value;
                }
                case LinkColorType.ByLinkType: {
                    return link.type && this.data.linkTypes[link.type]
                        ? this.data.linkTypes[link.type].color
                        : ForceGraph.DefaultLinkColor;
                }
            }

            return ForceGraph.DefaultLinkColor;
        }

        public enumerateObjectInstances(
            options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {

            return ForceGraphSettings.enumerateObjectInstances(this.settings, options);
        }

        public static converter(dataView: DataView, colors: IColorPalette): ForceGraphData {
            let settings: ForceGraphSettings = ForceGraph.parseSettings(dataView),
                nodes: ForceGraphNodes = {},
                minFiles: number = Number.MAX_VALUE,
                maxFiles: number = 0,
                linkedByName: LinkedByName = {},
                links: ForceGraphLink[] = [],
                linkDataPoints = {},
                linkTypeCount: number = 0,
                tooltipInfo: VisualTooltipDataItem[] = [],
                metadata: ForceGraphColumns<DataViewMetadataColumn> = ForceGraphColumns.getMetadataColumns(dataView);

            if (!metadata || !metadata.Source || !metadata.Target) {
                return null;
            }

            let tableRows: ForceGraphColumns<any>[] = ForceGraphColumns.getTableRows(dataView),
                weightFormatter: IValueFormatter = null;

            if (metadata.Weight) {
                let weightValue: number = settings.links.displayUnits;

                if (!weightValue && tableRows.length) {
                    weightValue = _.maxBy(tableRows, x => x.Weight).Weight;
                }

                weightFormatter = valueFormatter.create({
                    format: valueFormatter.getFormatStringByColumn(metadata.Weight, true),
                    precision: settings.links.decimalPlaces,
                    value: weightValue
                });
            }

            let sourceFormatter: IValueFormatter = valueFormatter.create({
                format: valueFormatter.getFormatStringByColumn(metadata.Source, true),
            });

            let targetFormatter: IValueFormatter = valueFormatter.create({
                format: valueFormatter.getFormatStringByColumn(metadata.Target, true),
            });

            tableRows.forEach((tableRow: ForceGraphColumns<any>) => {
                linkedByName[`${tableRow.Source},${tableRow.Target}`] = ForceGraph.DefaultValueOfExistingLink;

                if (!nodes[tableRow.Source]) {
                    nodes[tableRow.Source] = {
                        name: sourceFormatter.format(tableRow.Source),
                        image: tableRow.SourceType || ForceGraph.DefaultSourceType,
                        adj: {}
                    };
                }

                if (!nodes[tableRow.Target]) {
                    nodes[tableRow.Target] = {
                        name: targetFormatter.format(tableRow.Target),
                        image: tableRow.TargetType || ForceGraph.DefaultTargetType,
                        adj: {}
                    };
                }

                let source: ForceGraphNode = nodes[tableRow.Source],
                    target: ForceGraphNode = nodes[tableRow.Target];

                source.adj[target.name] = ForceGraph.DefaultValueOfExistingLink;
                target.adj[source.name] = ForceGraph.DefaultValueOfExistingLink;

                tooltipInfo = ForceGraphTooltipsFactory.build(tableRow, dataView.metadata.columns);

                let link: ForceGraphLink = {
                    source: source,
                    target: target,
                    weight: Math.max(metadata.Weight
                        ? (tableRow.Weight || ForceGraph.MinWeight)
                        : ForceGraph.MaxWeight,
                        ForceGraph.MinWeight),
                    formattedWeight: tableRow.Weight && weightFormatter.format(tableRow.Weight),
                    type: tableRow.LinkType || ForceGraph.DefaultLinkType,
                    tooltipInfo: tooltipInfo,
                };

                if (metadata.LinkType && !linkDataPoints[tableRow.LinkType]) {
                    linkDataPoints[tableRow.LinkType] = {
                        label: tableRow.LinkType,
                        color: colors.getColor((linkTypeCount++).toString()).value,
                    };
                };

                if (link.weight < minFiles) {
                    minFiles = link.weight;
                }

                if (link.weight > maxFiles) {
                    maxFiles = link.weight;
                }

                links.push(link);
            });

            return {
                nodes,
                links,
                minFiles,
                maxFiles,
                linkedByName,
                settings,
                linkTypes: linkDataPoints
            };
        }

        private static parseSettings(dataView: DataView): ForceGraphSettings {
            let settings: ForceGraphSettings = ForceGraphSettings.parse<ForceGraphSettings>(dataView);

            settings.size.charge = Math.min(
                Math.max(settings.size.charge, ForceGraph.MinCharge),
                ForceGraph.MaxCharge);

            settings.links.decimalPlaces = settings.links.decimalPlaces
                && Math.min(
                    Math.max(settings.links.decimalPlaces, ForceGraph.MinDecimalPlaces),
                    ForceGraph.MaxDecimalPlaces);

            return settings;
        }

        public update(options: VisualUpdateOptions): void {
            if (!options.dataViews || options.dataViews.length < ForceGraph.MinAmountOfDataViews) {
                return;
            }

            this.data = ForceGraph.converter(options.dataViews[0], this.colorPalette);

            if (!this.data) {
                this.removeElements();

                return;
            }

            this.viewport = options.viewport;

            let k: number = Math.sqrt(Object.keys(this.data.nodes).length /
                (this.viewport.width * this.viewport.height));

            this.removeElements();

            let svg: d3.Selection<any> = this.root
                .append('svg')
                .attr({
                    width: this.viewport.width,
                    height: this.viewport.height
                })
                .classed(ForceGraph.VisualClassName, true);
            this.forceLayout
                .gravity(ForceGraph.GravityFactor * k)
                .links(this.data.links)
                .size([this.viewport.width, this.viewport.height])
                .linkDistance(ForceGraph.LinkDistance)
                .charge(this.settings.size.charge / k);
            this.updateNodes();
            if (this.settings.animation.show) {
                this.forceLayout.on('tick', this.tick());
                this.forceLayout.start();
                this.setVisualData(svg);
            } else {
                let n: number = Object.keys(this.data.nodes).length;
                this.forceLayout.start();
                for (let i = n * n; i > 0; --i) { this.forceLayout.tick(); };
                this.forceLayout.stop();
                this.setVisualData(svg);
                this.forceLayout.on('tick', this.tick());
            }
        }

        private setVisualData(svg: d3.Selection<any>): void {
            this.paths = svg.selectAll(ForceGraph.LinkSelector.selector)
                .data(this.forceLayout.links())
                .enter()
                .append('path')
                .attr('id', (d, i) => 'linkid_' + this.uniqieId + i)
                .attr('stroke-width', (link: ForceGraphLink) => {
                    return this.settings.links.thickenLink
                        ? this.scale1to10(link.weight)
                        : ForceGraph.DefaultLinkThickness;
                })
                .classed(ForceGraph.LinkSelector.class, true)
                .style('stroke', (link: ForceGraphLink) => {
                    return this.getLinkColor(link);
                })
                .style('fill', (link: ForceGraphLink) => {
                    if (this.settings.links.showArrow) {
                        return this.getLinkColor(link);
                    }
                })
                .on('mouseover', () => {
                    return this.fadePath(
                        ForceGraph.HoverOpacity,
                        ForceGraph.DefaultLinkHighlightColor);
                })
                .on('mouseout', () => {
                    return this.fadePath(
                        ForceGraph.DefaultOpacity,
                        ForceGraph.DefaultLinkColor);
                });

            this.tooltipServiceWrapper.addTooltip(this.paths, (eventArgs: TooltipEventArgs<ForceGraphLink>) => {
                return eventArgs.data.tooltipInfo;
            });

            if (this.settings.links.showLabel) {
                let linklabelholderUpdate: d3.selection.Update<ForceGraphLink> = svg
                    .selectAll(ForceGraph.LinkLabelHolderSelector.selector)
                    .data(this.forceLayout.links());

                linklabelholderUpdate.enter()
                    .append('g')
                    .classed(ForceGraph.LinkLabelHolderSelector.class, true)
                    .append('text')
                    .classed(ForceGraph.LinkLabelSelector.class, true)
                    .attr('y', ForceGraph.DefaultYPosition)
                    .attr('text-anchor', ForceGraph.LinkTextAnchor)
                    .style('fill', ForceGraph.DefaultLinkFillColor)
                    .append('textPath')
                    .attr({
                        'xlink:href': (link: ForceGraphLink, index: number) => {
                            return ForceGraph.Href + '#linkid_' + this.uniqieId + index;
                        },
                        startOffset: ForceGraph.StartOffset
                    })
                    .text((link: ForceGraphLink) => {
                        return this.settings.links.colorLink === LinkColorType.ByLinkType
                            ? link.type
                            : link.formattedWeight;
                    });

                linklabelholderUpdate
                    .exit()
                    .remove();
            }

            // define the nodes
            this.nodes = svg.selectAll(ForceGraph.NodeSelector.selector)
                .data(this.forceLayout.nodes())
                .enter()
                .append('g')
                .attr('drag-resize-disabled', true)
                .classed(ForceGraph.NodeSelector.class, true)
                .call(this.forceLayout.drag)
                .on('mouseover', (node: ForceGraphNode) => {
                    node.isOver = true;
                    this.fadeNode(node);
                })
                .on('mouseout', (node: ForceGraphNode) => {
                    node.isOver = false;
                    this.fadeNode(node);
                })
                .on('mousedown', () => (d3.event as MouseEvent).stopPropagation());

            // render without animation
            if (!this.settings.animation.show) {
                const viewport: IViewport = this.viewportIn;
                let maxWidth: number = viewport.width * ForceGraph.ResolutionFactor,
                    maxHeight: number = viewport.height * ForceGraph.ResolutionFactor,
                    limitX = x => Math.max((viewport.width - maxWidth) / 2, Math.min((viewport.width + maxWidth) / 2, x)),
                    limitY = y => Math.max((viewport.height - maxHeight) / 2, Math.min((viewport.height + maxHeight) / 2, y));
                this.paths.attr("d", (link: ForceGraphLink) => {
                    link.source.x = limitX(link.source.x);
                    link.source.y = limitY(link.source.y);
                    link.target.x = limitX(link.target.x);
                    link.target.y = limitY(link.target.y);

                    return this.settings && this.settings.links && this.settings.links.showArrow
                        ? this.getPathWithArrow(link)
                        : this.getPathWithoutArrow(link);
                });
                this.nodes.attr('transform', (node: ForceGraphNode) => translate(limitX(node.x), limitY(node.y)));
            }

            // add the nodes
            if (this.settings.nodes.displayImage) {
                this.nodes.append('image')
                    .attr({
                        x: PixelConverter.toString(ForceGraph.ImagePosition),
                        y: PixelConverter.toString(ForceGraph.ImagePosition),
                        width: PixelConverter.toString(ForceGraph.ImageViewport.width),
                        height: PixelConverter.toString(ForceGraph.ImageViewport.height),
                        'xlink:href': (node: ForceGraphNode) => {
                            if (node.image) {
                                return this.getImage(node.image);
                            } else if (this.settings.nodes.defaultImage) {
                                return this.getImage(this.settings.nodes.defaultImage);
                            }

                            return ForceGraph.DefaultImage;
                        }
                    });
            } else {
                this.nodes
                    .append('circle')
                    .attr('r', (node: ForceGraphNode) => {
                        return isNaN(node.weight) || node.weight < ForceGraph.MinNodeWeight
                            ? ForceGraph.MinNodeWeight
                            : node.weight;
                    });
            }

            // add the text
            if (this.settings.labels.show) {
                this.nodes.append('text')
                    .attr({
                        x: ForceGraph.DefaultLabelX,
                        dy: ForceGraph.DefaultLabelDy
                    })
                    .style({
                        fill: this.settings.labels.color,
                        'font-size': PixelConverter.fromPoint(this.settings.labels.fontSize)
                    })
                    .text((node: ForceGraphNode) => {
                        if (node.name) {
                            if (node.name.length > this.settings.nodes.nameMaxLength) {
                                return node.name.substr(0, this.settings.nodes.nameMaxLength);
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

        private removeElements(): void {
            if (!this.root) {
                return;
            }

            this.root
                .selectAll('svg')
                .remove();
        }

        private updateNodes(): void {
            let thePreviousNodes: ForceGraphNode[] = this.forceLayout.nodes();

            this.forceLayout.nodes(d3.values(this.data.nodes));

            this.forceLayout.nodes().forEach((node: ForceGraphNode, index: number) => {
                if (!thePreviousNodes[index]) {
                    return;
                }

                this.updateNodeAttributes(node, thePreviousNodes[index]);
            });
        }

        private updateNodeAttributes(first: ForceGraphNode, second: ForceGraphNode): void {
            first.x = second.x;
            first.y = second.y;
            first.px = second.px;
            first.py = second.py;
            first.weight = second.weight;
        }

        private tick(): () => void {
            const viewport: IViewport = this.viewportIn;

            // limitX and limitY is necessary when you minimize the graph and then resize it to normal.
            // 'width/height * 20' seems enough to move nodes freely by force layout.
            let maxWidth: number = viewport.width * ForceGraph.ResolutionFactor,
                maxHeight: number = viewport.height * ForceGraph.ResolutionFactor,
                limitX = x => Math.max((viewport.width - maxWidth) / 2, Math.min((viewport.width + maxWidth) / 2, x)),
                limitY = y => Math.max((viewport.height - maxHeight) / 2, Math.min((viewport.height + maxHeight) / 2, y));

            return () => {
                this.paths.each(function () {
                    this.parentNode.insertBefore(this, this);
                });

                this.paths.attr('d', (link: ForceGraphLink) => {
                    link.source.x = limitX(link.source.x);
                    link.source.y = limitY(link.source.y);
                    link.target.x = limitX(link.target.x);
                    link.target.y = limitY(link.target.y);

                    return this.settings && this.settings.links && this.settings.links.showArrow
                        ? this.getPathWithArrow(link)
                        : this.getPathWithoutArrow(link);
                });

                this.nodes.attr('transform', (node: ForceGraphNode) => {
                    return translate(limitX(node.x), limitY(node.y));
                });
            };
        }

        private getPathWithArrow(link: ForceGraphLink): string {
            let dx: number = link.target.x - link.source.x,
                dy: number = link.target.y - link.source.y,
                dr: number = Math.sqrt(dx * dx + dy * dy),
                theta: number = Math.atan2(dy, dx) + Math.PI / 7.85,
                d90: number = Math.PI / 2,
                dtxs: number = link.target.x - 6 * Math.cos(theta),
                dtys: number = link.target.y - 6 * Math.sin(theta);

            return 'M' + link.source.x + ',' + link.source.y
                + 'A' + dr + ',' + dr + ' 0 0 1,' + link.target.x + ',' + link.target.y
                + 'A' + dr + ',' + dr + ' 0 0 0,' + link.source.x + ',' + link.source.y
                + 'M' + dtxs + ',' + dtys
                + 'l' + (3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + ',' + (-3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta))
                + 'L' + (dtxs - 3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + ',' + (dtys + 3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta))
                + 'z';
        }

        private getPathWithoutArrow(link: ForceGraphLink): string {
            let dx: number = link.target.x - link.source.x,
                dy: number = link.target.y - link.source.y,
                dr: number = Math.sqrt(dx * dx + dy * dy);

            return 'M' + link.source.x + ',' + link.source.y
                + 'A' + dr + ',' + dr + ' 0 0,1 ' + link.target.x + ',' + link.target.y;
        }

        private fadePath(opacity: number, highlightColor: string): (link: ForceGraphLink) => void {
            if (this.settings.links.colorLink !== LinkColorType.Interactive) {
                return;
            }

            return (link: ForceGraphLink) => {
                this.paths.style({
                    'stroke-opacity': (link: ForceGraphLink) => {
                        return link.source === link.source && link.target === link.target
                            ? ForceGraph.DefaultOpacity
                            : opacity;
                    },
                    'stroke': (link: ForceGraphLink) => {
                        return link.source === link.source && link.target === link.target
                            ? highlightColor
                            : ForceGraph.DefaultLinkColor;
                    }
                });
            };
        }

        private isReachable(a: ForceGraphNode, b: ForceGraphNode): boolean {
            if (a.name === b.name || this.data.linkedByName[a.name + ',' + b.name]) {
                return true;
            }

            let visited = {};

            for (let name in this.data.nodes) {
                visited[name] = false;
            };

            visited[a.name] = true;

            let stack = [];

            stack.push(a.name);

            while (stack.length > 0) {
                let cur = stack.pop(),
                    node = this.data.nodes[cur];

                for (let nb in node.adj) {
                    if (nb === b.name) {
                        return true;
                    }

                    if (!visited[nb]) {
                        visited[nb] = true;
                        stack.push(nb);
                    }
                }
            };

            return false;
        }

        private fadeNode(node: ForceGraphNode): void {
            if (!this.settings || this.settings.links.colorLink !== LinkColorType.Interactive) {
                return;
            }

            let self: ForceGraph = this,
                isHighlight = node.isOver || node.isDrag,
                opacity: number = isHighlight
                    ? ForceGraph.HoverOpacity
                    : ForceGraph.DefaultOpacity;

            let highlight: string = isHighlight
                ? ForceGraph.DefaultLinkHighlightColor
                : ForceGraph.DefaultLinkColor;

            this.nodes.style('stroke-opacity', function (node: ForceGraphNode) {
                let thisOpacity: number = (self.settings.nodes.highlightReachableLinks
                    ? self.isReachable(node, node)
                    : self.areNodesConnected(node, node))
                    ? ForceGraph.DefaultOpacity
                    : opacity;

                this.setAttribute('fill-opacity', thisOpacity);

                return thisOpacity;
            });

            this.paths.style('stroke-opacity', (link: ForceGraphLink) =>
                (this.settings.nodes.highlightReachableLinks ? this.isReachable(node, link.source) :
                    (link.source === node || link.target === node)) ? ForceGraph.DefaultOpacity : opacity);

            this.paths.style('stroke', (link: ForceGraphLink) =>
                (this.settings.nodes.highlightReachableLinks ? this.isReachable(node, link.source) :
                    (link.source === node || link.target === node)) ? highlight : ForceGraph.DefaultLinkColor);
        }

        private areNodesConnected(firstNode: ForceGraphNode, secondNode: ForceGraphNode): number | boolean {
            return this.data.linkedByName[firstNode.name + ',' + secondNode.name]
                || this.data.linkedByName[secondNode.name + ',' + firstNode.name]
                || firstNode.name === secondNode.name;
        }

        public destroy(): void {
            this.root = null;
        }
    }
}

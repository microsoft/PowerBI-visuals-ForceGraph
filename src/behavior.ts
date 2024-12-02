import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;

import { Selection as d3Selection } from "d3-selection";
type Selection<T> = d3Selection<any, T, any, any>;

import { ForceGraphNode, ForceGraphLink, ForceGraphBehaviorOptions, ISelectableDataPoint } from "./dataInterfaces";

export class ForceGraphBehavior {
    static DimmedOpacity: number = 0.4;
    static HoverOpacity: number = 0.4;
    static DefaultOpacity: number = 1.0;
    static DefaultLinkHighlightColor: string = "#f00";
    static DefaultLinkColor: string = "#bbb";

    private selectionManager: ISelectionManager;
    private nodeDataPoints: ForceGraphNode[];
    private nodesSelection: Selection<ForceGraphNode>;
    private nodeLabelsSelection: Selection<ForceGraphNode>;
    private linkDataPoints: ForceGraphLink[];
    private linksSelection: Selection<ForceGraphLink>;
    private clearCatcher: Selection<any>;

    private fadeNode: (node: ForceGraphNode) => void;

    constructor (selectionManager: ISelectionManager){
        this.selectionManager = selectionManager;
        this.selectionManager.registerOnSelectCallback(this.onSelectCallback.bind(this));
    }

    private onSelectCallback(selectionIds?: ISelectionId[]){
        this.applySelectionStateToData(selectionIds);
        this.renderSelection();
    }

    private applySelectionStateToData(selectionIds?: ISelectionId[]): void{
        const selectedIds: ISelectionId[] = <ISelectionId[]>this.selectionManager.getSelectionIds();
        this.setSelectedToDataPoints(this.nodeDataPoints, selectionIds || selectedIds);
        this.setSelectedToDataPoints(this.linkDataPoints, selectionIds || selectedIds);
    }

    private setSelectedToDataPoints(dataPoints: ForceGraphNode[] | ForceGraphLink[], ids: ISelectionId[]): void{
        dataPoints.forEach((dataPoint: ForceGraphNode | ForceGraphLink) => {
            dataPoint.selected = ids.some((id=> id.equals(dataPoint.identity)));
        });
    }
    
    public bindEvents(options: ForceGraphBehaviorOptions, fadeNode: (node: ForceGraphNode) => void): void {
        this.linkDataPoints = options.links.data();
        this.linksSelection = options.links;
        this.nodeDataPoints = options.nodes.data();
        this.nodesSelection = options.nodes;
        this.nodeLabelsSelection = options.nodes.select(".nodelabel");
        this.clearCatcher = options.clearCatcher;
        this.fadeNode = fadeNode;

        this.bindContextMenuEvent(this.nodesSelection);
        this.bindContextMenuEvent(this.linksSelection);
        this.bindContextMenuEvent(this.clearCatcher);

        this.bindClickEvent(this.nodesSelection);
        this.bindClickEvent(this.clearCatcher);

        this.bindMouseEvents(this.nodesSelection);
        this.bindKeyboardEvent(this.nodesSelection);

        this.applySelectionStateToData();
    }

    private bindContextMenuEvent(elements: Selection<any>): void {
        elements.on("contextmenu", (event: PointerEvent, dataPoint: ForceGraphNode | undefined) => {
            this.selectionManager.showContextMenu(dataPoint ? dataPoint.identity : {},
                {
                    x: event.clientX,
                    y: event.clientY
                }
            );
            event.preventDefault();
            event.stopPropagation();
        })
    }

    private bindClickEvent(elements: Selection<any>): void {
        elements.on("click", (event: PointerEvent, node: ForceGraphNode | undefined) => {
            if (node){
               this.handleSelection(node, event);
            }
            else {
                this.selectionManager.clear();
            }

            this.onSelectCallback();
            event.stopPropagation();
        });
    }

    private handleSelection(node: ForceGraphNode, event: PointerEvent | KeyboardEvent): void {
        const isMultiSelection: boolean = event.ctrlKey || event.metaKey || event.shiftKey;

        const getSelectionIds: (dataPoints: ISelectableDataPoint[]) => ISelectionId[] = dataPoints => dataPoints.map((dataPoint: ISelectableDataPoint) => dataPoint.identity);
        const nodeSelectableDataPoints: ISelectableDataPoint[] = [...node.links, node];
        const nodeSelectionIds: ISelectionId[] = Array.from(getSelectionIds(nodeSelectableDataPoints));
        
        const notSelectedDataPoints: ISelectableDataPoint[] = nodeSelectableDataPoints.filter((dataPoint: ISelectableDataPoint) => !dataPoint.selected);
        const notSelectedIds: ISelectionId[] = getSelectionIds(notSelectedDataPoints);
        const isSelection: boolean = !!notSelectedIds.length;

        const selectedIds: ISelectionId[] = <ISelectionId[]>this.selectionManager.getSelectionIds();
        const selectionManagerHasUniqIds: boolean = selectedIds.some(selectedId => !nodeSelectionIds.some(selectionId => selectionId.equals(selectedId)));

        if (isSelection && isMultiSelection){
            this.selectionManager.select(notSelectedIds, true);
        }
        else {
            const shouldUseMultiselect: boolean = (isMultiSelection || !selectionManagerHasUniqIds) && !isSelection; 
            this.selectionManager.select(nodeSelectionIds, shouldUseMultiselect);
        }
    }

    private bindKeyboardEvent(elements: Selection<any>): void {
        elements.on("keydown", (event : KeyboardEvent, node: ForceGraphNode) => {
            if (event.code !== "Enter" && event.code !== "Space") {
                return;
            }

            this.handleSelection(node, event);
            this.onSelectCallback();

            event.stopPropagation();
        });
    }

    private bindMouseEvents(elements: Selection<any>): void {
        elements
            .on("mouseover", (event: PointerEvent, node: ForceGraphNode) => {
                node.isOver = true;
                this.fadeNode(node);
            })
            .on("mouseout", (event: PointerEvent, node: ForceGraphNode) => {
                node.isOver = false;
                this.fadeNode(node);
                this.renderSelection();
            });
    }

    public renderSelection(){
        const dataPointHasSelection: boolean = this.nodeDataPoints.some((dataPoint: ForceGraphNode) => dataPoint.selected);

        this.nodesSelection.attr("aria-selected", (node: ForceGraphNode) => node.selected);
        this.nodesSelection.style("fill-opacity", (dataPoint: ForceGraphNode) => this.getOpacity(dataPoint.selected || dataPoint.links.some(link => link.selected), dataPointHasSelection));
        this.nodesSelection.style("stroke-opacity", (dataPoint: ForceGraphNode) => this.getOpacity(dataPoint.selected, dataPointHasSelection));
        
        this.linksSelection.style("stroke-opacity", (dataPoint: ForceGraphLink) => this.getOpacity(dataPoint.selected, dataPointHasSelection));
        
        this.nodeLabelsSelection.classed("selected", (dataPoint: ForceGraphNode) => dataPoint.selected && dataPointHasSelection);
    }

    private getOpacity(selected: boolean, hasSelection: boolean): number {
        if (hasSelection && !selected) {
            return ForceGraphBehavior.DimmedOpacity;
        }
        return ForceGraphBehavior.DefaultOpacity;
    }
}
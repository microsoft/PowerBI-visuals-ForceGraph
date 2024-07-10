import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;

import { Selection as d3Selection } from "d3-selection";
type Selection<T> = d3Selection<any, T, any, any>;

import { ForceGraphNode, ForceGraphLink, ForceGraphBehaviorOptions } from "./dataInterfaces";

export class ForceGraphBehavior {
    static DimmedOpacity: number = 0.4;
    static HoverOpacity: number = 0.4;
    static DefaultOpacity: number = 1.0;
    static DefaultLinkHighlightColor: string = "#f00";
    static DefaultLinkColor: string = "#bbb";

    private selectionManager: ISelectionManager;
    private nodeDataPoints: ForceGraphNode[];
    private nodesSelection: Selection<ForceGraphNode>;
    private linkDataPoints: ForceGraphLink[];
    private linksSelection: Selection<ForceGraphLink>;
    private clearCatcher: Selection<any>;

    private fadeNode: (node: ForceGraphNode) => void;

    constructor (selectionManager: ISelectionManager){
        this.selectionManager = selectionManager;
        this.selectionManager.registerOnSelectCallback(this.onSelectCallback.bind(this));
    }

    private onSelectCallback(bookmarkIds ?: ISelectionId[]){
        const selectedIds: ISelectionId[] = <ISelectionId[]>this.selectionManager.getSelectionIds();
        this.setSelectedToNodeDataPoints(bookmarkIds || selectedIds);
        this.setSelectedToLinkDataPoints();
        this.renderSelection();
    }

    private setSelectedToNodeDataPoints(ids: ISelectionId[]): void{
        this.nodeDataPoints.forEach((dataPoint: ForceGraphNode) => {
            dataPoint.selected = false;
            ids.forEach(bookmarkSelection => {
                if (bookmarkSelection.equals(dataPoint.identity)) {
                    dataPoint.selected = true;
                }
            });
        });
    }

    private setSelectedToLinkDataPoints(): void{
        this.linkDataPoints.forEach((dataPoint: ForceGraphLink) => {
            dataPoint.selected = dataPoint.source.selected || dataPoint.target.selected;
        });
    }
    
    public bindEvents(options: ForceGraphBehaviorOptions, fadeNode: (node: ForceGraphNode) => void): void {
        this.linkDataPoints = options.links.data();
        this.linksSelection = options.links;
        this.nodeDataPoints = options.nodes.data();
        this.nodesSelection = options.nodes;
        this.clearCatcher = options.clearCatcher;
        this.fadeNode = fadeNode;

        this.bindContextMenuEvent(this.nodesSelection);
        this.bindContextMenuEvent(this.linksSelection);
        this.bindContextMenuEvent(this.clearCatcher);

        this.bindClickEvent(this.nodesSelection);
        this.bindClickEvent(this.clearCatcher);

        this.bindMouseEvents(this.nodesSelection);
        this.bindKeyboardEvent(this.nodesSelection);
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
        elements.on("click", (event: PointerEvent, dataPoint: ForceGraphNode | undefined) => {
            const isMultiSelection: boolean = event.ctrlKey || event.metaKey || event.shiftKey;
            if (dataPoint){
                this.selectionManager.select(dataPoint.identity, isMultiSelection);
                event.stopPropagation();
            }
            else {
                this.selectionManager.clear();
            }
            this.onSelectCallback();
        })
    }

    private bindKeyboardEvent(elements: Selection<any>): void {
        elements.on("keydown", (event : KeyboardEvent, dataPoint: ForceGraphNode) => {
            if (event.code !== "Enter" && event.code !== "Space") {
                return;
            }

            const isMultiSelection: boolean = event.ctrlKey || event.metaKey || event.shiftKey;
            this.selectionManager.select(dataPoint.identity, isMultiSelection);

            event.stopPropagation();
            this.onSelectCallback();
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

        this.nodesSelection.style("stroke-opacity", (dataPoint: ForceGraphNode) => this.getOpacity(dataPoint.selected, dataPointHasSelection));
        this.nodesSelection.style("fill-opacity", (dataPoint: ForceGraphNode) => this.getOpacity(dataPoint.selected, dataPointHasSelection));
        this.linksSelection.style("stroke-opacity", (dataPoint: ForceGraphLink) => this.getOpacity(dataPoint.selected, dataPointHasSelection));

        this.nodesSelection.attr("aria-selected", (node: ForceGraphNode) => node.selected);
    }

    private getOpacity(selected: boolean, hasSelection: boolean): number {
        if (hasSelection && !selected) {
            return ForceGraphBehavior.DimmedOpacity;
        }
        return ForceGraphBehavior.DefaultOpacity;
    }
}
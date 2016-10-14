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

module powerbi.extensibility.visual {
    // powerbi.visuals
    import VisualTooltipDataItem = powerbi.visuals.VisualTooltipDataItem;

    export interface ForceGraphNode extends d3.layout.force.Node {
        name: string;
        image: string;
        adj: { [i: string]: number };
        x?: number;
        y?: number;
        isDrag?: boolean;
        isOver?: boolean;
    }

    export interface ForceGraphNodes {
        [i: string]: ForceGraphNode;
    }

    export interface ForceGraphLink {
        source: ForceGraphNode;
        target: ForceGraphNode;
        weight: number;
        formattedWeight: string;
        type: string;
        tooltipInfo: VisualTooltipDataItem[];
    }

    export interface ForceGraphData {
        nodes: ForceGraphNodes;
        links: ForceGraphLink[];
        minFiles: number;
        maxFiles: number;
        linkedByName: LinkedByName;
        linkTypes: {};
        settings: ForceGraphSettings;
    }

    export interface LinkedByName {
        [linkName: string]: number;
    }
}

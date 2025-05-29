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

import powerbi from "powerbi-visuals-api";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import { ClickEventType, VisualBuilderBase, d3Click } from "powerbi-visuals-utils-testutils";

import { ForceGraph as VisualClass } from "./../src/visual";

export class VisualBuilder extends VisualBuilderBase<VisualClass> {
    constructor(width: number, height: number) {
        super(width, height);
    }

    protected build(options: VisualConstructorOptions) {
        return new VisualClass(options);
    }

    public get svgElement(): SVGElement | null {
        return this.element.querySelector("svg.forceGraph");
    }

    public get mainElement(): HTMLElement | null {
        return this.element.querySelector("g.chartContainer");
    }

    public get linkLabels() : NodeListOf<HTMLElement> | undefined {
        return this.mainElement?.querySelectorAll("g.linklabelholder");
    }

    public get nodes(): NodeListOf<HTMLElement> | undefined {
        return this.mainElement?.querySelectorAll("g.node");
    }

    public get selectedNodes(): Element[] {
        return Array.from(this.nodes).filter((element: HTMLElement) => {
            const appliedOpacity: number = parseFloat(element.style.fillOpacity);
            return appliedOpacity === 1;
        });
    }

    public get links(): NodeListOf<HTMLElement> | undefined {
        return this.mainElement?.querySelectorAll("path.link");
    }

    public get selectedLinks(): Element[] {
        return Array.from(this.links).filter((element: HTMLElement) => {
            const appliedOpacity: number = parseFloat(element.style.strokeOpacity);
            return appliedOpacity === 1;
        });
    }

    public get images(): NodeListOf<SVGElement> | undefined {
        return this.mainElement?.querySelectorAll("image");
    }

    public get circles(): NodeListOf<SVGElement> | undefined {
        return this.mainElement?.querySelectorAll("circle");
    }

    public get nodeTexts(): NodeListOf<HTMLElement> | undefined {
        return this.mainElement?.querySelectorAll("g.node text");
    }

    public get linkLabelsText(): NodeListOf<HTMLElement> | undefined {
        return this.mainElement?.querySelectorAll("text.linklabel");
    }

    public get linkLabelsTextPath(): NodeListOf<SVGElement> | undefined {
        return this.mainElement?.querySelectorAll("text.linklabel textpath");
    }

    public nodeClick(text: string, eventType: ClickEventType = ClickEventType.Default): void{
        const circle: SVGElement | undefined = Array.from(this.circles)
            .find((element: SVGElement) => {
                return element.ariaLabel === text;
            });
    
        if (!circle) {
            return;
        }
    
        d3Click(
            circle,
            parseFloat(<string>circle?.getAttribute("x")),
            parseFloat(<string>circle?.getAttribute("y")),
            eventType
        );
    }

    public nodeKeydown(text: string, keyboardEvent: KeyboardEvent) {
        const circle: SVGElement | undefined = Array.from(this.circles)
        .find((element: SVGElement) => {
            return element.ariaLabel === text;
        });

        if (!circle) {
            return;
        }

        circle.dispatchEvent(keyboardEvent);
    }
}

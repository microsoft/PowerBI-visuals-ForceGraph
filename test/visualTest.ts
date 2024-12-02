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

import DataView = powerbi.DataView;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { ClickEventType, assertColorsMatch, renderTimeout } from "powerbi-visuals-utils-testutils";

import { areColorsEqual, getSolidColorStructuralObject } from "./helpers/helpers";
import { VisualData as ForceGraphData } from "./visualData";
import { VisualBuilder as ForceGraphBuilder } from "./visualBuilder";

import { ForceGraphMetadataRoleHelper, ForceGraphTooltipsFactory, ForceGraphTooltipInputObject } from "./../src/tooltipsFactory";

describe("ForceGraph", () => {
    let visualBuilder: ForceGraphBuilder,
        defaultDataViewBuilder: ForceGraphData,
        dataView: DataView;

    beforeEach(() => {
        visualBuilder = new ForceGraphBuilder(1000, 500);
        defaultDataViewBuilder = new ForceGraphData();

        dataView = defaultDataViewBuilder.getDataView();
    });

    describe("ForceGraphTooltipsFactory", () => {
        it("class is available", () => {
            expect(ForceGraphTooltipsFactory).toBeDefined();
        });

        it("shouldn't throw any unexpected exceptions when arguments are undefined", () => {
            expect(() => {
                ForceGraphTooltipsFactory.build(undefined, undefined);
            }).not.toThrow();
        });

        it("shouldn't throw any unexpected exceptions when arguments are null", () => {
            expect(() => {
                ForceGraphTooltipsFactory.build(null, null);
            }).not.toThrow();
        });

        it("should return an empty array when inputObject doesn't have any own properties", () => {
            let dataViewMetadataColumns: DataViewMetadataColumn[] = dataView.metadata.columns,
                tooltips: VisualTooltipDataItem[];

            tooltips = ForceGraphTooltipsFactory.build({}, dataViewMetadataColumns);

            expect(tooltips).toBeDefined();
            expect(tooltips).not.toBeNull();
            expect(tooltips.length).toBe(0);
        });

        it("should return array of tootips", () => {
            let dataViewMetadataColumns: DataViewMetadataColumn[] = dataView.metadata.columns,
                tooltips: VisualTooltipDataItem[],
                testValues: string[] = ["SourceTestValue", "TargetTestValue"],
                inputObject: ForceGraphTooltipInputObject;

            inputObject = {
                "Source": testValues[0],
                "Target": testValues[1]
            };

            tooltips = ForceGraphTooltipsFactory.build(inputObject, dataViewMetadataColumns);

            expect(tooltips).toBeDefined();
            expect(tooltips).not.toBeNull();

            expect(tooltips.length).toBe(2);

            tooltips.forEach((tooltip: VisualTooltipDataItem, index: number) => {
                expect(tooltip).toBeDefined();
                expect(tooltip).not.toBeNull();

                expect(tooltip.displayName).toBeDefined();
                expect(tooltip.value).toBe(testValues[index]);
            });
        });
    });

    describe("ForceGraphMetadataRoleHelper", () => {
        it("class is available", () => {
            expect(ForceGraphMetadataRoleHelper).toBeDefined();
        });

        it("shouldn't throw any unexpected exceptions when arguments are undefined", () => {
            expect(() => {
                ForceGraphMetadataRoleHelper.getColumnByRoleName(undefined, undefined);
            }).not.toThrow();
        });

        it("shouldn't throw any unexpected exceptions when arguments are null", () => {
            expect(() => {
                ForceGraphMetadataRoleHelper.getColumnByRoleName(null, null);
            }).not.toThrow();
        });

        it("should return null when roleName isn't available", () => {
            let dataViewMetadataColumns: DataViewMetadataColumn[] = dataView.metadata.columns,
                column: DataViewMetadataColumn;

            column = ForceGraphMetadataRoleHelper.getColumnByRoleName(
                dataViewMetadataColumns,
                "ForceGraphMetadataRoleHelper");

            expect(column).toBeNull();
        });

        it("shouldn't return null when roleName is available", () => {
            let dataViewMetadataColumns: DataViewMetadataColumn[] = dataView.metadata.columns,
                column: DataViewMetadataColumn;

            column = ForceGraphMetadataRoleHelper.getColumnByRoleName(
                dataViewMetadataColumns,
                "Source");

            expect(column).toBeDefined();
            expect(column).not.toBeNull();
        });
    });

    describe("DOM tests", () => {
        it("svg element created", () => {
            visualBuilder.updateFlushAllD3Transitions(dataView);
            expect(visualBuilder.svgElement).toBeDefined()
        });

        it("update", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                const categorySourceUniqValues: powerbi.PrimitiveValue[] = [...new Set(dataView.categorical?.categories?.[0].values)];
                const categoryTargetUniqValues: powerbi.PrimitiveValue[] = [...new Set(dataView.categorical?.categories?.[1].values)];
                const categorySourceLength: number = categorySourceUniqValues.length,
                    categoryTargetLength: number = categoryTargetUniqValues.length,
                    categorySourceTargetOverlapLength: number = categorySourceUniqValues.filter((item: powerbi.PrimitiveValue) => categoryTargetUniqValues.includes(item)).length;

                expect(visualBuilder.links?.length)
                    .toBe(Math.max(categorySourceLength, categoryTargetLength));

                expect(visualBuilder.nodes?.length)
                    .toBe(categorySourceLength + categoryTargetLength - categorySourceTargetOverlapLength);

                done();
            });
        });

        it("curved arrows", () => {
            visualBuilder.updateFlushAllD3Transitions(dataView);
            const linkPaths = visualBuilder.links;
            linkPaths?.forEach((linkPath: HTMLElement) => {
                if (linkPath["__data__"].source.name === linkPath["__data__"].target.name) {
                    let path = linkPath.getAttribute("d");
                    let curvedPath = /M (-)*\d*\.?\d* (-)*\d*\.?\d* C (-)*\d*\.?\d* (-)*\d*\.?\d*, (-)*\d*\.?\d* (-)*\d*\.?\d*, (-)*\d*\.?\d* (-)*\d*\.?\d*/;
                    expect(curvedPath.test(path)).toBe(true);
                }
            });
        });
    });

    describe("Format settings test", () => {
        describe("Data labels", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    labels: {
                        show: true
                    }
                };
            });

            it("show", () => {
                (dataView.metadata.objects as any).labels.show = true;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                expect(getFirstNodeText(visualBuilder)).toBeDefined();

                (dataView.metadata.objects as any).labels.show = false;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                expect(getFirstNodeText(visualBuilder)).not.toBeDefined();
            });

            function getFirstNodeText(visualBuilder: ForceGraphBuilder): HTMLElement | undefined {
                return visualBuilder.nodeTexts?.[0];
            }

            it("color", () => {
                const color: string = "#334455";

                (dataView.metadata.objects as any).labels.color = getSolidColorStructuralObject(color);
                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.nodeTexts?.forEach((element: HTMLElement) => {
                        assertColorsMatch(element.style.fill, color);
                    });
            });

            it("font size", () => {
                const fontSize: number = 22,
                    expectedFontSize: string = "29.3333px";

                (dataView.metadata.objects as any).labels.fontSize = fontSize;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.nodeTexts?.forEach((element: HTMLElement) => {
                        expect(element.style.fontSize).toBe(expectedFontSize);
                    });
            });
        });

        describe("Links", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    links: {
                        showLabel: true
                    }
                };
            });

            it("links labels on", () => {
                const linkLabelsTextPath = visualBuilder.linkLabelsTextPath;
                linkLabelsTextPath?.forEach((element: SVGElement) => {
                    const text: string | null = element.textContent;
                    expect(text).toBeDefined();
                });
            });

            it("links labels format", () => {
                const decimalPlaces: number = 2;

                (dataView.metadata.objects as any).links.decimalPlaces = decimalPlaces;
                (dataView.metadata.objects as any).links.displayUnits = 1000;

                visualBuilder.updateFlushAllD3Transitions(dataView);

                const linkLabelsTextPath = visualBuilder.linkLabelsTextPath;

                linkLabelsTextPath?.forEach((element: SVGElement) => {
                    const text: string | null = element.textContent;
                    const secondPart: string[] | undefined = text?.split(".")[1].split("");
                    const filtered: string[] | undefined= secondPart?.filter(x => x && !Number.isNaN(parseInt(x)));

                    expect(filtered?.length).toBeLessThan(secondPart?.length);
                    expect(filtered?.length).toEqual(decimalPlaces);
                });
            });
        });

        describe("Nodes", () => {
            it("image show", () => {
                dataView.metadata.objects = {
                    nodes: {
                        displayImage: true
                    }
                };

                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.images?.forEach((element: SVGElement) => {
                    expect(element).toBeDefined();
                });

                (dataView.metadata.objects as any).nodes.displayImage = false;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.images?.forEach((element: SVGElement) => {
                    expect(element).not.toBeDefined();
                });
            });

            it("nodes labels format", () => {
                const rand = new Uint32Array(defaultDataViewBuilder.valuesSourceTarget.length);
                window.crypto.getRandomValues(rand);
                const dates: Date[] = [];
                rand.forEach((value: number) => dates.push(new Date(value)));
                defaultDataViewBuilder.valuesSourceTarget.forEach((x, i) => x[1] = <any>dates[i]);
                dataView = defaultDataViewBuilder.getDataView();
                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.nodeTexts?.forEach((node: HTMLElement) => {
                    const text: string | null = node.textContent;
                    dates.forEach(date => {
                        expect(text).not.toEqual(date.toString());
                    });
                });
            });
        });
    });

    describe("Accessibility", () => {
        it("title should be filled for all of images", () => {
            dataView.metadata.objects = {
                nodes: {
                    displayImage: true,
                },
            };

            visualBuilder.updateFlushAllD3Transitions(dataView);

            visualBuilder.images?.forEach((image: SVGElement) => {
                    expect(image.hasAttribute("title")).toBeTrue();
                });
        });

        describe("High contrast mode", () => {
            const backgroundColor: string = "#000000";
            const foregroundColor: string = "#ffff00";

            beforeEach(() => {
                visualBuilder.visualHost.colorPalette.isHighContrast = true;

                visualBuilder.visualHost.colorPalette.background = { value: backgroundColor };
                visualBuilder.visualHost.colorPalette.foreground = { value: foregroundColor };
            });

            it("should use `foreground` color as a fill for all of nodes", (done) => {
                visualBuilder.updateRenderTimeout(dataView, () => {
                    const circles: SVGElement[] = Array.from(visualBuilder.circles);

                    expect(isColorAppliedToElements(circles, foregroundColor, "fill")).toBeTrue();

                    done();
                });
            });

            it("should use `background` color as a stroke for all of nodes", (done) => {
                visualBuilder.updateRenderTimeout(dataView, () => {
                    const circles: SVGElement[] = Array.from(visualBuilder.circles);

                    expect(isColorAppliedToElements(circles, backgroundColor, "stroke")).toBeTrue();

                    done();
                });
            });

            it("should use `foreground` color as a fill for all of labels", (done) => {
                dataView.metadata.objects = {
                    links: {
                        showLabel: true
                    }
                };

                visualBuilder.updateRenderTimeout(dataView, () => {
                    const labels: HTMLElement[] = Array.from(visualBuilder.nodeTexts);

                    expect(isColorAppliedToElements(labels, foregroundColor, "fill")).toBeTrue();

                    done();
                });
            });

            function isColorAppliedToElements(
                elements: SVGElement[] | HTMLElement[],
                color?: string,
                colorStyleName: string = "fill"
            ): boolean {
                return elements.some((element: SVGElement | HTMLElement) => {
                    const currentColor: string = getComputedStyle(element).getPropertyValue(colorStyleName);

                    if (!currentColor || !color) {
                        return currentColor === color;
                    }

                    return areColorsEqual(currentColor, color);
                });
            }
        });

        describe("Keyboard navigation and related aria-attributes tests:", () => {
            let dataViewKN: DataView;

            beforeEach(() => {
                dataViewKN = defaultDataViewBuilder.getDataView();
            });

            it("should have role=listbox and aria-multiselectable attributes correctly set", (done) => {
                visualBuilder.updateRenderTimeout(dataViewKN, () => {
                    const containerElement: HTMLElement | null = visualBuilder.mainElement;

                    expect(containerElement?.getAttribute("role")).toBe("listbox");
                    expect(containerElement?.getAttribute("aria-multiselectable")).toBe("true");

                    done();
                }, 100);
            });

            it("enter toggles the correct node", () => {
                const enterEvent = new KeyboardEvent("keydown", { code: "Enter", bubbles: true });
                checkKeyboardSingleSelection(enterEvent);
            });

            it("space toggles the correct node", () => {
                const spaceEvent = new KeyboardEvent("keydown", { code: "Space", bubbles: true });
                checkKeyboardSingleSelection(spaceEvent);
            });

            it("multiselection should work with ctrlKey", () => {
                const enterEventCtrlKey = new KeyboardEvent("keydown", { code: "Enter", bubbles: true, ctrlKey: true });
                checkKeyboardMultiSelection(enterEventCtrlKey);
            });

            it("multiselection should work with metaKey", () => {
                const enterEventMetaKey = new KeyboardEvent("keydown", { code: "Enter", bubbles: true, metaKey: true });
                checkKeyboardMultiSelection(enterEventMetaKey);
            });

            it("multiselection should work with shiftKey", () => {
                const enterEventShiftKey = new KeyboardEvent("keydown", { code: "Enter", bubbles: true, shiftKey: true });
                checkKeyboardMultiSelection(enterEventShiftKey);
            });

            function checkKeyboardSingleSelection(keyboardSingleSelectionEvent: KeyboardEvent): void {
                visualBuilder.updateFlushAllD3Transitions(dataViewKN);

                visualBuilder.nodeKeydown("William", keyboardSingleSelectionEvent);
                expect(visualBuilder.selectedNodes.length).toBe(2);
                expect(visualBuilder.selectedLinks.length).toBe(1);

                visualBuilder.nodeKeydown("Brazil", keyboardSingleSelectionEvent);
                expect(visualBuilder.selectedNodes.length).toBe(4);
                expect(visualBuilder.selectedLinks.length).toBe(3);
            }

            function checkKeyboardMultiSelection(keyboardMultiselectionEvent: KeyboardEvent): void {
                visualBuilder.updateFlushAllD3Transitions(dataViewKN);
                // select first node
                visualBuilder.nodeKeydown("William", keyboardMultiselectionEvent);
                // multiselect second node
                visualBuilder.nodeKeydown("Brazil", keyboardMultiselectionEvent);

                expect(visualBuilder.selectedNodes.length).toBe(4);
                expect(visualBuilder.selectedLinks.length).toBe(3);
            }
        });
    });

    describe("Selection tests", () => {
        let dataViewSelection: DataView;
        beforeEach(() => {
            dataViewSelection = defaultDataViewBuilder.getDataView();
        });

        it("node can be selected", (done) => {
            visualBuilder.updateRenderTimeout(dataViewSelection, () => {
                visualBuilder.nodeClick("William");

                renderTimeout(() => {
                    expect(visualBuilder.selectedNodes?.length).toBe(2);
                    expect(visualBuilder.selectedLinks?.length).toBe(1);
                    done();
                });
            }, 100);
        });

        it("multi-selection should work with ctrlKey", (done) => {
            visualBuilder.updateRenderTimeout(dataViewSelection, () => {
                checkMultiselection(ClickEventType.CtrlKey, done);
            }, 100);
        });

        it("multi-selection should work with metaKey", (done) => {
            visualBuilder.updateRenderTimeout(dataViewSelection, () => {
                checkMultiselection(ClickEventType.MetaKey, done);
            }, 100);
        });

        it("multi-selection should work with shiftKey", (done) => {
            visualBuilder.updateRenderTimeout(dataViewSelection, () => {
                checkMultiselection(ClickEventType.ShiftKey, done);
            }, 100);
        });

        function checkMultiselection(eventType: number, done: DoneFn): void {
            visualBuilder.nodeClick("William");
            renderTimeout(() => {
                expect(visualBuilder.selectedNodes?.length).toBe(2);
                expect(visualBuilder.selectedLinks?.length).toBe(1);

                visualBuilder.nodeClick("Olivia", eventType);
                renderTimeout(() => {
                    expect(visualBuilder.selectedNodes?.length).toBe(4);
                    expect(visualBuilder.selectedLinks?.length).toBe(2);
                    done();
                });
            });
        }
    });
});

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

/// <reference path="_references.ts"/>

module powerbi.extensibility.visual.test {
    // powerbi.extensibility.visual.test
    import ForceGraphData = powerbi.extensibility.visual.test.ForceGraphData;
    import ForceGraphBuilder = powerbi.extensibility.visual.test.ForceGraphBuilder;
    import getSolidColorStructuralObject = powerbi.extensibility.visual.test.helpers.getSolidColorStructuralObject;

    // powerbi.extensibility.utils.test
    import assertColorsMatch = powerbi.extensibility.utils.test.helpers.color.assertColorsMatch;

    // ForceGraph1449359463895
    import ForceGraphTooltipsFactory = powerbi.extensibility.visual.ForceGraph1449359463895.ForceGraphTooltipsFactory;
    import ForceGraphTooltipInputObject = powerbi.extensibility.visual.ForceGraph1449359463895.ForceGraphTooltipInputObject;
    import ForceGraphMetadataRoleHelper = powerbi.extensibility.visual.ForceGraph1449359463895.ForceGraphMetadataRoleHelper;

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
            it("svg element created", () => expect(visualBuilder.element[0]).toBeInDOM());

            it("update", (done) => {
                visualBuilder.updateRenderTimeout(dataView, () => {
                    const categorySourceLength: number = _.uniq(dataView.categorical.categories[0].values).length,
                        categoryTargetLength: number = _.uniq(dataView.categorical.categories[1].values).length;

                    expect(visualBuilder.mainElement.children("path.link").length)
                        .toBe(Math.max(categorySourceLength, categoryTargetLength));

                    expect(visualBuilder.mainElement.children("g.node").length)
                        .toBe(categorySourceLength + categoryTargetLength);

                    done();
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

                    expect(getFirstNodeText(visualBuilder)).toBeInDOM();

                    (dataView.metadata.objects as any).labels.show = false;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    expect(getFirstNodeText(visualBuilder)).not.toBeInDOM();
                });

                function getFirstNodeText(visualBuilder: ForceGraphBuilder): JQuery {
                    return visualBuilder.mainElement
                        .children("g.node")
                        .first()
                        .find("text");
                }

                it("color", () => {
                    const color: string = "#334455";

                    (dataView.metadata.objects as any).labels.color = getSolidColorStructuralObject(color);
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.mainElement
                        .children("g.node")
                        .first()
                        .find("text")
                        .toArray()
                        .map($)
                        .forEach((element: JQuery) => {
                            assertColorsMatch(element.css("fill"), color);
                        });
                });

                it("font size", () => {
                    const fontSize: number = 22,
                        expectedFontSize: string = "29.3333px";

                    (dataView.metadata.objects as any).labels.fontSize = fontSize;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.mainElement
                        .children("g.node")
                        .first()
                        .find("text")
                        .toArray()
                        .map($)
                        .forEach((element: JQuery) => {
                            expect(element.css("font-size")).toBe(expectedFontSize);
                        });
                });

                it("animation is turned off", (done) => {
                    (dataView.metadata.objects as any).animation = { show: false };
                    visualBuilder.updateRenderTimeout(dataView, () => {
                        let originalTransform = visualBuilder.mainElement
                            .children("g.node")
                            .map((item, element) => element.getAttribute("transform"));
                        setTimeout(() => {
                            let afterFullRender = visualBuilder.mainElement
                                .children("g.node")
                                .map((item, element) => element.getAttribute("transform"));
                            expect(_.isEqual(afterFullRender, originalTransform)).toBe(true);
                            done();
                        }, 1000);
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
                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    visualBuilder.linkLabelsTextPath.each((i: number, element: Element) => {
                        expect($(element).text()).not.toBeEmpty();
                    });
                });

                it("links labels format", () => {
                    const decimalPlaces: number = 2;

                    (dataView.metadata.objects as any).links.decimalPlaces = decimalPlaces;
                    (dataView.metadata.objects as any).links.displayUnits = 1000;

                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.linkLabelsTextPath.each((i: number, element: Element) => {
                        const secondPart: string[] = $(element).text().split(".")[1].split(""),
                            filtered: string[] = secondPart.filter(x => !_.isNaN(_.parseInt(x)));

                        expect(filtered.length).toBeLessThan(secondPart.length);
                        expect(filtered.length).toEqual(decimalPlaces);
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

                    visualBuilder.nodes
                        .toArray()
                        .map($)
                        .forEach((element: JQuery) => {
                            expect(element.children("image")).toBeInDOM();
                        });

                    (dataView.metadata.objects as any).nodes.displayImage = false;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.nodes
                        .toArray()
                        .map($)
                        .forEach((element: JQuery) => {
                            expect(element.children("image")).not.toBeInDOM();
                        });
                });

                it("nodes labels format", () => {
                    const dates: Date[] = _.range(defaultDataViewBuilder.valuesSourceTarget.length)
                        .map(x => new Date(Math.random() * 10000000000000));

                    defaultDataViewBuilder.valuesSourceTarget.forEach((x, i) => x[1] = <any>dates[i]);
                    dataView = defaultDataViewBuilder.getDataView();
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.nodeTexts.each((i, e) => {
                        let text = $(e).text();
                        dates.forEach(date => {
                            expect(text).not.toEqual(date.toString());
                        });
                    });
                });
            });
        });
    });
}

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
    // powerbi
    import DataView = powerbi.DataView;
    import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
    import DataViewObjects = powerbi.DataViewObjects;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
    import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
    import VisualObjectInstance = powerbi.VisualObjectInstance;

    interface GetValueFunctionPrototype {
        (objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): any;
    }

    export interface DataViewProperty {
        [propertyName: string]: DataViewObjectPropertyIdentifier;
    }

    export interface DataViewProperties {
        [propertyName: string]: DataViewProperty;
    }

    export class SettingsParser {
        private static FillColorRegExp: RegExp = /fillColor/;

        public static getDefault() {
            return new this();
        }

        public static parse<T extends SettingsParser>(dataView: DataView): T {
            let settings: T = <T>this.getDefault(),
                properties: DataViewProperties;

            if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
                return settings;
            }

            properties = settings.getProperties();

            for (let objectName in properties) {
                for (let propertyName in properties[objectName]) {
                    let defaultValue: any = settings[objectName][propertyName],
                        getValueFunction: GetValueFunctionPrototype;

                    getValueFunction = this.getValueFunctionByPropertyName(propertyName);

                    settings[objectName][propertyName] = getValueFunction(
                        dataView.metadata.objects,
                        properties[objectName][propertyName],
                        defaultValue);
                }
            }

            return settings;
        }

        public getProperties(): DataViewProperties {
            let properties: DataViewProperties = {},
                objectNames: string[] = Object.keys(this);

            objectNames.forEach((objectName: string) => {
                let propertyNames: string[] = Object.keys(this[objectName]);

                properties[objectName] = {};

                propertyNames.forEach((propertyName: string) => {
                    properties[objectName][propertyName] =
                        SettingsParser.createDataViewObjectPropertyIdentifier(objectName, propertyName);
                });
            });

            return properties;
        }

        private static createDataViewObjectPropertyIdentifier(
            objectName: string,
            propertyName: string): DataViewObjectPropertyIdentifier {

            return {
                objectName,
                propertyName
            };
        }

        private static getValueFunctionByPropertyName(propertyName: string): GetValueFunctionPrototype {
            if (this.FillColorRegExp.test(propertyName)) {
                return DataViewObjects.getFillColor;
            }

            return DataViewObjects.getValue;
        }

        public static enumerateObjectInstances(
            settings: SettingsParser,
            options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {

            let object: DataViewProperties = settings && settings[options.objectName];

            if (!object) {
                return [];
            }

            let instance: VisualObjectInstance = {
                objectName: options.objectName,
                selector: null,
                properties: {}
            };

            for (let key in object) {
                if (_.has(object, key)) {
                    instance.properties[key] = object[key];
                }
            }

            return {
                instances: [instance]
            }
        }
    }
}

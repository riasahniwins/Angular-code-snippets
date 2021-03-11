import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'manageRecursiveData',
    pure: false
})

export class ManageRecursiveDataPipe implements PipeTransform {
    transform(mainData: any[], parentId: number = 0, rootValue: any = 0): any[] {
        if (mainData) {
            let result = this.filterNodes(mainData, parentId);
            return result;
        }
        else {
            return;
        }
    }

    filterNodes(mainData: any, parentId: number): any[] {
        let items = mainData.filter((node) => {
            return node.parentId == parentId;
        });
        items.map((node) => {
            let result = this.filterNodes(mainData, node.id);
            node["children"] = result;
        });
        return items;
    }
}
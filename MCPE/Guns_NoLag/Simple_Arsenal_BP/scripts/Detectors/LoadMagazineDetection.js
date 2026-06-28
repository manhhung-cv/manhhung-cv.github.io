import { EntityComponentTypes, EntityInventoryComponent, ItemStack, world } from '@minecraft/server'
import { FirearmNameUtil, FirearmUtil, ItemUtil } from '../Utilities';

world.afterEvents.itemStartUse.subscribe((eventData) => {
	const magazineItemStack = eventData.itemStack;
    let isEmpty = false;
    if(FirearmUtil.getMagazineObjectFromItemStackEmpty(magazineItemStack)) {
        isEmpty = true;
    }

    const magazineObject = FirearmUtil.getMagazineObjectFromItemStackBoth(magazineItemStack);
    if(magazineObject === null) { return; }
    if(!isEmpty && magazineItemStack.amount > 1) { return; }

    let moveEmptyOff = false;
    if(isEmpty && magazineItemStack.amount > 1) {
        moveEmptyOff = true;
    }

    let magazineDurability = ItemUtil.tryGetDurability(magazineItemStack);
    if(magazineDurability === magazineObject.maxAmmo) { return; }
    if(magazineDurability === null && isEmpty) {
        magazineDurability = 0;
    }
    if(magazineDurability === null) { return; }
    
    const player = eventData.source;
    const inv = player.getComponent(EntityComponentTypes.Inventory);
    if(inv === undefined) { return; }
    if(!(inv instanceof EntityInventoryComponent)) { return; }
    const container = inv.container;
    if(container === undefined) { return; }

    for(let i=0; i<inv.inventorySize; i++) {
        const bulletItemStack = container.getItem(i);
        if(bulletItemStack === undefined || !FirearmUtil.isBulletType(bulletItemStack, magazineObject.bulletType)) { continue; }
        
        let addBulletCount = bulletItemStack.amount;
        let removeBulletCount = bulletItemStack.amount;
        if(bulletItemStack.amount >= 5) {
            addBulletCount = 5;
            removeBulletCount = 5;
        }


        //add up to 5 bullets to magazine
        if(isEmpty) {
            let newMagazineItemStack = new ItemStack(magazineObject.tag);
            ItemUtil.trySetDurability(newMagazineItemStack, addBulletCount);
            FirearmNameUtil.renewMagazineName(newMagazineItemStack, addBulletCount);
            container.setItem(player.selectedSlotIndex, newMagazineItemStack);
        }
        else if(magazineDurability+addBulletCount < magazineObject.maxAmmo) {
            ItemUtil.trySetDurability(magazineItemStack, magazineDurability+addBulletCount);
            FirearmNameUtil.renewMagazineName(magazineItemStack,  magazineDurability+addBulletCount);
            container.setItem(player.selectedSlotIndex, magazineItemStack);
        }
        else {
            container.setItem(player.selectedSlotIndex, magazineObject.itemStack);
            removeBulletCount = magazineObject.maxAmmo - magazineDurability;
        }

        //move empty stack off & keep only 1 in mainhand
        if(moveEmptyOff) {
            container.addItem(new ItemStack(magazineObject.tag+"_empty", magazineItemStack.amount-1));
        }

        //remove 1 bullet
        if(bulletItemStack.amount >= removeBulletCount+1) {
            bulletItemStack.amount -= removeBulletCount;
            container.setItem(i, bulletItemStack);
        }
        else {
            container.setItem(i);
        }
        break;
    }  
});


/*
world.afterEvents.itemStartUse.subscribe((eventData) => {
    const itemStack = eventData.itemStack;
    let attributes = "\n";
    attributes += `amount: ${itemStack.amount}\n`;
    attributes += `getCanDestroy: ${itemStack.getCanDestroy()}\n`;
    attributes += `getCanPlaceOn: ${itemStack.getCanPlaceOn()}\n`;
    attributes += `components: [`;
    itemStack.getComponents().forEach(comp => { attributes += `${comp.typeId}, `; });
    attributes += `]\n`;
    attributes += `getDynamicPropertyIds: ${itemStack.getDynamicPropertyIds()}\n`;
    attributes += `getLore: ${itemStack.getLore()}\n`;
    attributes += `tags: ${itemStack.getTags()}\n`;
    attributes += `isStackable: ${itemStack.isStackable}\n`;
    attributes += `keepOnDeath: ${itemStack.keepOnDeath}\n`;
    attributes += `lockMode: ${itemStack.lockMode}\n`;
    attributes += `maxAmount: ${itemStack.maxAmount}\n`;
    attributes += `nameTag: ${itemStack.nameTag}\n`;
    attributes += `typeId: ${itemStack.typeId}\n`;
    console.log(`attributes: ${attributes}`);
});
*/
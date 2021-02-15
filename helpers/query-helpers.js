async function updateById(model, id, newValuesObj, transaction) {
    const newValueKeys = Object.keys(newValuesObj);
    try {
        await model.update(newValuesObj, { where: { id: id }, ...transaction });
        const updatedVals = await model.findByPk(id, { attributes: [ ...newValueKeys ], ...transaction });
        return { data: updatedVals }
    } catch(err) {
        return { error: err.message }
    }
}

async function updateRecipeList(model, recipeId, incomingList, existingItems, transaction, areTags=false) {
    const updatedItems = [];
    for (let i = 0; i < incomingList.length; i++) {
        let finalItem;
        let position = !areTags ? { position: i } : null;
        let incomingItem = incomingList[i];
        if (typeof incomingItem.id === "string") {
            delete incomingItem.id;
            finalItem = await model.create({
                ...incomingItem,
                recipe_id: recipeId,
                ...position
            }, transaction)
        } else {
            await updateById(model, incomingItem.id, {
                ...incomingItem,
                ...position
            }, transaction);
            finalItem = await model.findByPk(incomingItem.id);
        }
        updatedItems.push(finalItem);
    }
    const updatesSortedById = [...updatedItems].sort((a, b) => a.id - b.id);
    let updatesPointer = 0;
    for (let i = 0; i < existingItems.length; i++) {
        if (!updatesSortedById[updatesPointer] || existingItems[i].id !== updatesSortedById[updatesPointer].id) {
            await model.destroy({ where: { id: existingItems[i].id }}, transaction);
            continue;
        } 
        updatesPointer++;
    }
    return updatedItems;
}

module.exports = { updateById, updateRecipeList }
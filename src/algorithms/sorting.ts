import { useVisualizationStore, animatedSwap } from "@/stores/visualizationStore";
import { delay } from "@/lib/utils";

// ============================================
// ANIMATED SWAP HELPER
// Performs the 3-phase swap animation: lift → slide → settle
// ============================================

async function performAnimatedSwap(indexA: number, indexB: number): Promise<void> {
    const store = useVisualizationStore.getState();
    await animatedSwap(indexA, indexB, store);
}

// ============================================
// BUBBLE SORT
// ============================================

export async function bubbleSort() {
    const store = useVisualizationStore.getState();
    const { array, speed } = store;
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Check if paused or stopped
            const currentState = useVisualizationStore.getState();
            if (!currentState.isRunning) return;
            while (currentState.isPaused) {
                await delay(100);
                const pauseCheck = useVisualizationStore.getState();
                if (!pauseCheck.isRunning) return;
                if (!pauseCheck.isPaused) break;
            }

            // Highlight comparing elements
            store.updateElement(j, { state: "comparing" });
            store.updateElement(j + 1, { state: "comparing" });
            store.incrementComparisons();

            await delay(speed * 0.6);

            const currentArray = useVisualizationStore.getState().array;
            if (currentArray[j].value > currentArray[j + 1].value) {
                // Perform animated swap (lift → slide → settle)
                await performAnimatedSwap(j, j + 1);
            } else {
                // Reset state if no swap needed
                store.updateElement(j, { state: "default" });
                store.updateElement(j + 1, { state: "default" });
            }
        }

        // Mark as sorted
        store.updateElement(n - 1 - i, { state: "sorted" });
    }

    // Mark first element as sorted
    store.updateElement(0, { state: "sorted" });
    store.setIsSorted(true);
    store.setIsRunning(false);
}

// ============================================
// SELECTION SORT
// ============================================

export async function selectionSort() {
    const store = useVisualizationStore.getState();
    const { array, speed } = store;
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        store.updateElement(i, { state: "comparing" });

        for (let j = i + 1; j < n; j++) {
            const currentState = useVisualizationStore.getState();
            if (!currentState.isRunning) return;
            while (currentState.isPaused) {
                await delay(100);
                const pauseCheck = useVisualizationStore.getState();
                if (!pauseCheck.isRunning) return;
                if (!pauseCheck.isPaused) break;
            }

            store.updateElement(j, { state: "comparing" });
            store.incrementComparisons();
            await delay(speed * 0.5);

            const currentArray = useVisualizationStore.getState().array;
            if (currentArray[j].value < currentArray[minIdx].value) {
                if (minIdx !== i) {
                    store.updateElement(minIdx, { state: "default" });
                }
                minIdx = j;
                store.updateElement(minIdx, { state: "pivot" });
            } else {
                store.updateElement(j, { state: "default" });
            }
        }

        if (minIdx !== i) {
            // Perform animated swap
            await performAnimatedSwap(i, minIdx);
        }

        store.updateElement(minIdx, { state: "default" });
        store.updateElement(i, { state: "sorted" });
    }

    store.updateElement(n - 1, { state: "sorted" });
    store.setIsSorted(true);
    store.setIsRunning(false);
}

// ============================================
// INSERTION SORT
// ============================================

export async function insertionSort() {
    const store = useVisualizationStore.getState();
    const { array, speed } = store;
    const n = array.length;

    store.updateElement(0, { state: "sorted" });

    for (let i = 1; i < n; i++) {
        const currentState = useVisualizationStore.getState();
        if (!currentState.isRunning) return;

        store.updateElement(i, { state: "pivot" });
        await delay(speed * 0.5);

        let j = i;
        while (j > 0) {
            const pauseState = useVisualizationStore.getState();
            if (!pauseState.isRunning) return;
            while (pauseState.isPaused) {
                await delay(100);
                const pauseCheck = useVisualizationStore.getState();
                if (!pauseCheck.isRunning) return;
                if (!pauseCheck.isPaused) break;
            }

            store.updateElement(j - 1, { state: "comparing" });
            store.incrementComparisons();
            await delay(speed * 0.4);

            const currentArray = useVisualizationStore.getState().array;
            if (currentArray[j].value < currentArray[j - 1].value) {
                // Perform animated swap
                await performAnimatedSwap(j, j - 1);
                store.updateElement(j, { state: "sorted" });
                j--;
            } else {
                store.updateElement(j - 1, { state: "sorted" });
                break;
            }
        }

        store.updateElement(j, { state: "sorted" });
    }

    store.setIsSorted(true);
    store.setIsRunning(false);
}

// ============================================
// QUICK SORT
// ============================================

export async function quickSort() {
    const store = useVisualizationStore.getState();

    await quickSortHelper(0, store.array.length - 1);

    // Mark all as sorted
    const finalArray = useVisualizationStore.getState().array;
    for (let i = 0; i < finalArray.length; i++) {
        store.updateElement(i, { state: "sorted" });
        await delay(30); // Quick cascade effect
    }

    store.setIsSorted(true);
    store.setIsRunning(false);
}

async function quickSortHelper(low: number, high: number) {
    const store = useVisualizationStore.getState();
    if (!store.isRunning) return;

    if (low < high) {
        const pivotIndex = await partition(low, high);
        await quickSortHelper(low, pivotIndex - 1);
        await quickSortHelper(pivotIndex + 1, high);
    }
}

async function partition(low: number, high: number): Promise<number> {
    const store = useVisualizationStore.getState();
    const { speed } = store;

    store.updateElement(high, { state: "pivot" });

    let i = low - 1;

    for (let j = low; j < high; j++) {
        const currentState = useVisualizationStore.getState();
        if (!currentState.isRunning) return high;

        while (currentState.isPaused) {
            await delay(100);
            const pauseCheck = useVisualizationStore.getState();
            if (!pauseCheck.isRunning) return high;
            if (!pauseCheck.isPaused) break;
        }

        store.updateElement(j, { state: "comparing" });
        store.incrementComparisons();
        await delay(speed * 0.5);

        const currentArray = useVisualizationStore.getState().array;
        if (currentArray[j].value <= currentArray[high].value) {
            i++;
            if (i !== j) {
                // Perform animated swap
                await performAnimatedSwap(i, j);
            }
        }

        store.updateElement(j, { state: "default" });
        if (i >= low && i !== j) store.updateElement(i, { state: "default" });
    }

    if (i + 1 !== high) {
        // Perform animated swap for pivot
        await performAnimatedSwap(i + 1, high);
    }

    store.updateElement(high, { state: "default" });
    store.updateElement(i + 1, { state: "sorted" });

    return i + 1;
}

// ============================================
// ALGORITHM RUNNER
// ============================================

export async function runAlgorithm(algorithm: string) {
    switch (algorithm) {
        case "bubble":
            await bubbleSort();
            break;
        case "selection":
            await selectionSort();
            break;
        case "insertion":
            await insertionSort();
            break;
        case "quick":
            await quickSort();
            break;
        default:
            await bubbleSort();
    }
}

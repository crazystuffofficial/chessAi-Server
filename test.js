const Stockfish = require("stockfish");

// Helper function to initialize Stockfish and run commands
function runStockfish(fen, depth = 17) {
    return new Promise((resolve) => {
        const stockfish = Stockfish();
        let bestMove = null;

        stockfish.onmessage = (message) => {
            if (message.startsWith("bestmove")) {
                bestMove = message.split(" ")[1];
                stockfish.postMessage("quit");
                resolve(bestMove);
            }
        };

        stockfish.postMessage("uci");
        stockfish.postMessage(`position fen ${fen}`);
        stockfish.postMessage(`go depth ${depth}`);
    });
}

// Helper function to generate possible moves for Black from a FEN
async function generateBlackMoves(fen) {
    const stockfish = Stockfish();
    let possibleMoves = [];

    return new Promise((resolve) => {
        stockfish.onmessage = (message) => {
            if (message.startsWith("Legal uci moves")) {
                possibleMoves = message.replace("Legal uci moves:", "").trim().split(" ");
                stockfish.postMessage("quit");
                resolve(possibleMoves);
            }
        };


        stockfish.postMessage("uci");
        stockfish.postMessage(`position fen ${fen}`);
        stockfish.postMessage("d"); // Outputs the board state, including legal moves
    });
}

// Helper function to generate new FEN strings for each move
async function getNewFenForMove(fen, move) {
    const stockfish = Stockfish();
    let newFen = null;

    return new Promise((resolve) => {
        stockfish.onmessage = (message) => {
            if (message.startsWith("Fen:") || message.includes("Fen:")) {
                newFen = message.split("Fen:")[1].trim();
                stockfish.postMessage("quit");
                resolve(newFen);
            }
        };

        stockfish.postMessage("uci");
        stockfish.postMessage(`position fen ${fen} moves ${move}`);
        stockfish.postMessage("d");
    });
}
async function test(initialFen){
    const depth = 15;
    var x = await runStockfish(initialFen, depth);
    const result = {
        initialBestMove: await runStockfish(initialFen, depth),
        blackMovesAnalysis: []
    };
    const blackMoves = await generateBlackMoves(initialFen);

    const analyses = await Promise.all(
        blackMoves.map(async (move) => {
            const newFen = await getNewFenForMove(initialFen, move);
    
            if (newFen) {
                const bestMove = await runStockfish(newFen, depth);
                return { move, newFen, bestMove };
            }
    
            return null; // In case newFen is null, return a placeholder
        })
    );
    
    // Filter out null results (if any) and add them to the analysis
    result.blackMovesAnalysis = analyses.filter((analysis) => analysis !== null);
    console.log(result);
    return result;
}
test("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
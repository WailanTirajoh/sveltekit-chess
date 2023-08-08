declare global {
	type Player = 1 | 2;

	interface PieceMove {
		startPosition: string;
		finalPosition: string;
		player: Player;
	}
	// We will create rule interface latter when we get into this (Should be after drag & drop)
	interface Piece {
		name: PieceName;
		icon: string;
		rule: (board: Board, piecePosition: PieceMove) => boolean;
		possibleMoves: Array<ChessPosition>;
		possibleAttacks: Array<ChessPosition>;
	}

	interface PlayerPiece {
		id: string;
		player: Player;
		piece: Piece;
	}

	type PieceName = 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn';

	/**
	 * {num}_{num}
	 * row_col
	 */
	type ChessPosition = string;
	type Board = Partial<Record<ChessPosition, PlayerPiece>>;

	interface ActivePiece extends PlayerPiece {
		position: ChessPosition;
	}

	interface PlayerPieceMove extends PlayerPiece {
		position: ChessPosition;
	}

	type PieceMoveHistory = {
		startPosition: PlayerPieceMove;
		endPosition: PlayerPieceMove;
	};

	type PlayerTime = Record<Player, number>;

	interface Winner {
		player: Player | null;
		type: string | null;
	}
}

export {};

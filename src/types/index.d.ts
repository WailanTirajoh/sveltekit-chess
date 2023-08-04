declare global {
	type Player = 1 | 2;

	// We will create rule interface latter when we get into this (Should be after drag & drop)
	interface Piece {
		name: PieceName;
		icon: string;
		rule: (startPosition: string, finalPosition: string, player: Player) => boolean;
		possibleMove: Array<ChessPosition>;
	}

	interface PlayerPiece {
		piece: Piece;
		player: Player;
	}

	type PieceName = 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn';
	type ChessPosition = string;
	type BoardPosition = Partial<Record<ChessPosition, PlayerPiece>>;

	interface ActivePiece extends PlayerPiece {
		position: ChessPosition;
	}

	interface PlayerPieceMove extends PlayerPiece {
		position: ChessPosition;
	}
	type PieceMoveHistory = Array<PlayerPieceMove>;
}

export {};

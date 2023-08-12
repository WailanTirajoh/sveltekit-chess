declare global {
	type Player = 1 | 2;
	type PieceName = 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn';
	type ChessPosition = string; // {vertical_num}_{horizontal_num}
	type Board = Partial<Record<ChessPosition, PlayerPiece>>;
	type PlayerTime = Record<Player, number>;
	type CaputredPieces = Array<Piece>;

	type PlayerInfo = Record<
		Player,
		{
			time: number;
			capturedPieces: CaputredPieces;
		}
	>;

	interface Piece {
		name: PieceName;
		icon: string;
		// rule: (chess: ChessInfo, pieceMove: PieceMove) => boolean;
		possibleMoves: Array<ChessPosition>;
		possibleAttacks: Array<ChessPosition>;
		power: number;
		moveHistory: Array<PieceMoveHistory>;
	}

	type PieceRule = Record<
		PieceName,
		{
			rule: (chess: ChessInfo, pieceMove: PieceMove) => boolean;
		}
	>;

	interface PieceMove {
		startPosition: ChessPosition;
		finalPosition: ChessPosition;
		player: Player;
	}

	interface PlayerPiece {
		id: string;
		player: Player;
		piece: Piece;
	}

	interface ActivePiece extends PlayerPiece {
		position: ChessPosition;
	}

	interface PlayerPieceMove extends PlayerPiece {
		position: ChessPosition;
	}

	interface PieceMoveHistory {
		startPosition: ChessPosition;
		finalPosition: ChessPosition;
		moveAt: number;
	}

	interface Winner {
		player: Player | null;
		type: string | null;
	}

	interface UserInfo {
		uid: string;
		displayName: string | null;
		email: string | null;
		photoUrl: string | null;
	}

	interface ChessInfo {
		id: string;
		board: Board;
		moveHistory: Array<PieceMoveHistory>;
		players: PlayerInfo;
		moveCount: number;
		currentPlayer: Player;
		playerWhite: UserInfo;
		playerBlack: UserInfo;
		winner: Winner;
	}
}

export {};

public class WumpusWorld {
    public static void main(String[] args) {
        Board board = new Board(4); // Create a 4x4 board
        board.displayBoard(); // Display the initial board
    }
}

class Board {
    private String[][] grid;
    private int size;

    public Board(int size) {
        this.size = size;
        grid = new String[size][size];
        initializeBoard();
    }

    private void initializeBoard() {
        // Fill the board with empty spaces
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                grid[i][j] = " . "; // Empty space
            }
        }
        // Place entities on the board
        placeEntities();
    }

    private void placeEntities() {
        // Place Wumpus
        grid[1][1] = " W "; // Wumpus

        // Place pits
        grid[2][2] = " P "; // Pit
        grid[3][0] = " P "; // Another Pit

        // Place gold
        grid[3][3] = " G "; // Gold
    }

    public void displayBoard() {
        System.out.println("Current Board:");
        for (int i = 0; i < size; i++) {
            System.out.print(" | ");
            for (int j = 0; j < size; j++) {
                System.out.print(grid[i][j] + " | ");
            }
            System.out.println();
            System.out.println("------" + "-----".repeat(size));
        }
    }
}

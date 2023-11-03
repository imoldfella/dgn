package main

import "github.com/spf13/cobra"

func main() {

	var rootCmd = &cobra.Command{
		Use: "dghttp",
	}
	rootCmd.AddCommand(&cobra.Command{
		Use:   "configure",
		Short: "run [dir]",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {

		},
	})
	rootCmd.AddCommand(&cobra.Command{
		Use:   "install",
		Short: "run [dir]",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			install()
		},
	})
	rootCmd.Execute()

}

func install() {

}

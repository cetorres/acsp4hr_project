#!/usr/bin Rscript
args = commandArgs(trailingOnly=TRUE)

# Check for the arguments
if (length(args)<3) {
  stop("Please inform the dataset file (.csv), the user id, and the variables.", call.=FALSE)
}

library(data.table)                         # For fread()
fread(args[1],                              # Must be in working directory
      sep = ',',                            # comma separating columns
      header = TRUE) ->                     # Columns have headers
  df                                        # R assignment goes either
                                            #  direction; this feels more
                                            #  natural to me, but I'm in the
                                            #  minority.

# Get the variables passed via arguments.
#  The independent (predictor) variable goes into x, and
#  the dependent (outcome) variable goes into y.
variables = strsplit(args[3], ",")
variables = unlist(variables)
if (length(variables) < 2) {
  stop("Please inform 2 variables.", call.=FALSE)
}
df[[variables[1]]] -> x
df[[variables[2]]] -> y

# Plot filename
plot_path = "./dataset_plot_images/"
plot_file = sprintf("%s", paste("simple_regression_", args[2], "_", format(Sys.time(), "%Y%m%d_%H%M%S"), ".pdf", sep=""))
plot_filepath = sprintf("%s", paste(plot_path, plot_file, sep=""))
pdf(plot_filepath)

# I don't usually do much error checking here - I know my data before I 
#  open it - but we should probably do that. So, I'll add some

# Let's look at the data. Most people would just jump in, but exploratory
#  data analysis is important.
if(is.numeric(x) == TRUE &         # Need numbers, not characters, etc.
   is.numeric(y) == TRUE) {
  plot(x,                          # x-axis variable
       y,                          # y-axis variable
       main = paste(colnames(y),   # Main title for graph, concatenated
                    "vs",             #  with a space between items
                    colnames(x)),  # paste0() does it with no space
       xlab = colnames(x),         # label for x-axis
       ylab = colnames(y), 
       pch = 16,                      # I like dots better than the default
       cex = 0.5)                     # Make the dots half-size
}

# Assuming the data look roughly linear, and there aren't any obvious
#  outliers (there are ways to test for outliers that we could incorporate),
#  let's do the regression (skipping the data check this time)
lm(y ~ x,                             # Regress y on x
   data = df) ->                      # Get the data from df
  y_lm                                # Assign to y_lm
summary(y_lm)                         # Display all the information

# There are methods of pulling out portions of the summary. E.g.:
coef(y_lm)                            # Get the regression coefficients

# Post-hocs. Hardly anyone ever does these, but they should. See, 
#  for example: Verzani, J. (2014). Using R for Introductory Statistics, 
#  Second Edition. CRC Press. (There's a PDF of the this out on the
#  internet; I think Verzani put it there, in case you can't get it 
#  through other means.)
plot(y_lm)
# Four plots here: (need to hit <Return> to see them in sequence)
#  1. Residuals vs. Fitted. The numbered points are probably outliers
#  2. A Normal Q-Q plot. What points fail to be normally distributed?
#     According to the usual significance level of 5%, 95% of the
#     points should fall near the Q-Q diagonal. (package:cars has
#     a Q-Q plot function that puts the 95% confidence interval on
#     this graph.)
#  3. Scale-Location. Should be a roughly flat line (in red) with the
#     outliers noted. (This one is actually pretty decent, as these
#     things go.)
#  4. Residual vs. leverage. Points that are beyond the "Cook's distance"
#     from zero are "high leverage" point meaning that they are exerting
#     an abnormally large influence on the regression, and those points
#     should be removed.
# Ideally, after removing points that are outliers or high leverage, the
#  regression should be rerun.

# Saved plot
cat(paste('Saved plot:', plot_file, sep=' '))

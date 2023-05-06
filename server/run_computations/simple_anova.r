#!/usr/bin Rscript
args = commandArgs(trailingOnly=TRUE)

# Check for the arguments
if (length(args)<2) {
  stop("Please inform the dataset file (.csv) and the user id.", call.=FALSE)
}

library(data.table)                         # For fread()
fread(args[1],                        # Must be in working directory
      sep = ',',                            # comma separating columns
      header = TRUE) ->                     # Columns have headers
  df                                        # R assignment goes either
                                            #  direction; this feels more
                                            #  natural to me, but I'm in the
                                            #  minority.

# Plot filename
plot_path = "./dataset_plot_images/"
plot_file = sprintf("%s", paste("simple_anova_", args[2], "_", format(Sys.time(), "%Y%m%d_%H%M%S"), ".pdf", sep=""))
plot_filepath = sprintf("%s", paste(plot_path, plot_file, sep=""))
pdf(plot_filepath)

# sample2.csv is roughly normally distributed. sample3.csv is not.

# ANOVA requires two things: normality and homoscedasticity (a.k.a.,
#  equality of variance). So, we'll check those here.

# Normality

if(length(df$Score[df$Group == "A"]) < 5000) {                    # Everyone has a preferred 
  (shapiro.test(
    df$Score[df$Group == "A"]))$p.value ->   #  test. Shapiro-Wilks is
    A_st                                     #  mine, but is limited to
} else {                                     #  5000 points
  (ks.test(df$Score[df$Group == "A"],
           "pnorm"))$p.value ->              # Kolmogorov-Smirnov test
    A_st
}
if(length(df$Score[df$Group == "B"]) < 5000) {
  (shapiro.test(
    df$Score[df$Group == "B"]))$p.value ->
    B_st
} else {                                     #
  (ks.test(df$Score[df$Group == "B"],
           "pnorm"))$p.value ->              # 
    B_st
}

# Equality of variance
library(car)
leveneTest(Score ~ Group, data  = df)$`Pr(>F)`[1] -> 
  df_lT

# Let's look at the data. Most people would just jump in, but exploratory
#  data analysis is important.
boxplot(Score ~ Group,
        data = df)
# The open circles are outliers, and should be removed, probably.

# User should set alpha; the default is 0.05
0.05 -> alpha

library(lmPerm)
if(A_st > alpha &                           # Normal
   B_st > alpha &                           # Normal
   df_lT > alpha) {                         # Equal variance
  # Analysis of variance (ANOVA)
    aov(Score ~ as.factor(Group),
      data = df) ->
    df_aov
} else {
  # There are several alternatives if normality or equal variance fail.
  #  I'll default to the permutation analysis of variance, although
  #  Kruskal-Wallis is also used, especially if there are more than
  #  two groups.
  aovp(Score ~ as.factor(Group),
       data = df) ->
    df_aov
}

summary(df_aov)
# Mostly people care about the p-value, which is 'Pr(>F)' for the 
#  regular ANOVA, and 'Pr(Prob)' for the permutation analysis of
#  variance.

# There is a post-hoc test if the p-value < alpha and there are more than
#  two groups. That is the Tukey honest significant differences test.
#  (Amazingly, this is the same Tukey who came up with the Fast Fourier
#  Transform; he got around!) The Tukey hsd compares which of the
#  multiple groups are different:
TukeyHSD(df_aov)                            # Error if only two groups

# Effect size

# The most common effect size estimate is Cohen's d, although it is
#  not correct for non-normal datasets. For nonnormal datasets, I
#  recommend the delta-MAD (Median Absolute Deviation). That can be
#  found on my Github site, although I haven't documented it very well
#  yet. It is not in widespread use (yet).
#
# There are a ton of things that go into Cohen's d, in terms of 
#  corrections for sample size, unequal variances, etc., etc. I'm just
#  putting the basic one in here.
library(effsize)
cohen.d(df$Score, df$Group)

# Saved plot
cat(paste('Saved plot:', plot_file, sep=' '))
